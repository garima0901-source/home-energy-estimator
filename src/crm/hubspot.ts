import { PIPELINE } from "./properties.ts";
import type { CrmGateway, DealSummary, ExistingContact, Owner, PipelineRef, Props } from "./gateway.ts";

// HubSpot CRM v3/v4 REST API over plain fetch. Auth is a private-app token
// with crm.objects.contacts/deals/owners + crm.schemas scopes.

const BASE = "https://api.hubapi.com";

// HubSpot-defined association type IDs
const ASSOC = {
  dealToContact: 3,
  noteToContact: 202,
  noteToDeal: 214,
  taskToContact: 204,
  taskToDeal: 216,
} as const;

export class HubSpotError extends Error {
  status: number;
  body: string;
  constructor(status: number, body: string, path: string) {
    super(`HubSpot ${status} on ${path}: ${body.slice(0, 300)}`);
    this.status = status;
    this.body = body;
  }
}

export class HubSpotClient {
  #token: string;
  constructor(token: string) {
    this.#token = token;
  }

  async request<T>(method: string, path: string, body?: unknown, attempt = 1): Promise<T> {
    const res = await fetch(BASE + path, {
      method,
      headers: { Authorization: `Bearer ${this.#token}`, "Content-Type": "application/json" },
      body: body === undefined ? undefined : JSON.stringify(body),
      signal: AbortSignal.timeout(15_000),
    });
    // Respect rate limits (private apps: ~100-190 requests / 10s) with one retry.
    if ((res.status === 429 || res.status >= 500) && attempt < 3) {
      const wait = Number(res.headers.get("Retry-After") ?? 1) * 1000;
      await new Promise((r) => setTimeout(r, wait * attempt));
      return this.request(method, path, body, attempt + 1);
    }
    const text = await res.text();
    if (!res.ok) throw new HubSpotError(res.status, text, path);
    return (text ? JSON.parse(text) : undefined) as T;
  }
}

const toStrings = (props: Props) =>
  Object.fromEntries(
    Object.entries(props)
      .filter(([, v]) => v !== undefined)
      .map(([k, v]) => [k, String(v)]),
  );

export class HubSpotGateway implements CrmGateway {
  mode = "hubspot" as const;
  #hs: HubSpotClient;
  #pipeline?: PipelineRef;
  #owners?: Owner[];
  #account?: { portalId: number; uiDomain: string };

  constructor(token: string) {
    this.#hs = new HubSpotClient(token);
  }

  async findContactByEmail(email: string, properties: string[]): Promise<ExistingContact | null> {
    try {
      const qs = new URLSearchParams({ idProperty: "email", properties: properties.join(",") });
      const c = await this.#hs.request<ExistingContact>(
        "GET",
        `/crm/v3/objects/contacts/${encodeURIComponent(email)}?${qs}`,
      );
      return { id: c.id, properties: c.properties };
    } catch (err) {
      if (err instanceof HubSpotError && err.status === 404) return null;
      throw err;
    }
  }

  async upsertContactByEmail(email: string, props: Props): Promise<string> {
    const res = await this.#hs.request<{ results: { id: string }[] }>(
      "POST",
      "/crm/v3/objects/contacts/batch/upsert",
      { inputs: [{ id: email, idProperty: "email", properties: toStrings(props) }] },
    );
    return res.results[0].id;
  }

  async updateContact(id: string, props: Props): Promise<void> {
    await this.#hs.request("PATCH", `/crm/v3/objects/contacts/${id}`, { properties: toStrings(props) });
  }

  async dealsForContact(contactId: string): Promise<DealSummary[]> {
    const assoc = await this.#hs.request<{ results: { toObjectId: number | string }[] }>(
      "GET",
      `/crm/v4/objects/contacts/${contactId}/associations/deals?limit=100`,
    );
    if (!assoc.results.length) return [];
    const deals = await this.#hs.request<{ results: { id: string; properties: Record<string, string | null> }[] }>(
      "POST",
      "/crm/v3/objects/deals/batch/read",
      {
        properties: ["pipeline", "dealstage", "hs_is_closed"],
        inputs: assoc.results.map((r) => ({ id: String(r.toObjectId) })),
      },
    );
    return deals.results.map((d) => ({
      id: d.id,
      pipeline: d.properties.pipeline ?? "",
      stage: d.properties.dealstage ?? "",
      isClosed: d.properties.hs_is_closed === "true",
    }));
  }

  // Prefer the dedicated pipeline created by the setup script; fall back to
  // the portal's default pipeline (free HubSpot accounts allow only one).
  async resolvePipeline(): Promise<PipelineRef> {
    if (this.#pipeline) return this.#pipeline;
    const { results } = await this.#hs.request<{
      results: {
        id: string;
        label: string;
        displayOrder: number;
        stages: { id: string; label: string; displayOrder: number; metadata: { isClosed?: string } }[];
      }[];
    }>("GET", "/crm/v3/pipelines/deals");
    const chosen =
      results.find((p) => p.label === PIPELINE.label) ??
      results.find((p) => p.id === "default") ??
      results.sort((a, b) => a.displayOrder - b.displayOrder)[0];
    if (!chosen) throw new Error("No deal pipeline found in HubSpot");
    const stages = [...chosen.stages].sort((a, b) => a.displayOrder - b.displayOrder);
    this.#pipeline = {
      pipelineId: chosen.id,
      label: chosen.label,
      newStageId: stages[0].id,
      closedStageIds: stages.filter((s) => s.metadata.isClosed === "true").map((s) => s.id),
    };
    return this.#pipeline;
  }

  async createDeal(props: Props, contactId: string): Promise<string> {
    const res = await this.#hs.request<{ id: string }>("POST", "/crm/v3/objects/deals", {
      properties: toStrings(props),
      associations: [assoc(contactId, ASSOC.dealToContact)],
    });
    return res.id;
  }

  async updateDeal(id: string, props: Props): Promise<void> {
    await this.#hs.request("PATCH", `/crm/v3/objects/deals/${id}`, { properties: toStrings(props) });
  }

  async createNote(html: string, contactId: string, dealId?: string, ownerId?: string): Promise<string> {
    const res = await this.#hs.request<{ id: string }>("POST", "/crm/v3/objects/notes", {
      properties: toStrings({ hs_timestamp: new Date().toISOString(), hs_note_body: html, hubspot_owner_id: ownerId }),
      associations: [assoc(contactId, ASSOC.noteToContact), ...(dealId ? [assoc(dealId, ASSOC.noteToDeal)] : [])],
    });
    return res.id;
  }

  async createTask(
    task: { subject: string; body: string; dueAt: Date; priority: "HIGH" | "MEDIUM" | "LOW" },
    contactId: string,
    dealId?: string,
    ownerId?: string,
  ): Promise<string> {
    const res = await this.#hs.request<{ id: string }>("POST", "/crm/v3/objects/tasks", {
      properties: toStrings({
        hs_timestamp: task.dueAt.toISOString(),
        hs_task_subject: task.subject,
        hs_task_body: task.body,
        hs_task_status: "NOT_STARTED",
        hs_task_priority: task.priority,
        hs_task_type: "CALL",
        hubspot_owner_id: ownerId,
      }),
      associations: [assoc(contactId, ASSOC.taskToContact), ...(dealId ? [assoc(dealId, ASSOC.taskToDeal)] : [])],
    });
    return res.id;
  }

  async listOwners(): Promise<Owner[]> {
    if (this.#owners) return this.#owners;
    const { results } = await this.#hs.request<{
      results: { id: string; email: string; firstName?: string; lastName?: string; archived?: boolean }[];
    }>("GET", "/crm/v3/owners?limit=100&archived=false");
    this.#owners = results.map((o) => ({
      id: o.id,
      email: o.email,
      name: [o.firstName, o.lastName].filter(Boolean).join(" ") || o.email,
    }));
    return this.#owners;
  }

  async recordUrl(kind: "contact" | "deal", id: string): Promise<string | undefined> {
    try {
      this.#account ??= await this.#hs.request("GET", "/account-info/v3/details");
      const { portalId, uiDomain } = this.#account!;
      return `https://${uiDomain}/contacts/${portalId}/record/${kind === "contact" ? "0-1" : "0-3"}/${id}`;
    } catch {
      return undefined;
    }
  }
}

function assoc(toId: string, typeId: number) {
  return { to: { id: toId }, types: [{ associationCategory: "HUBSPOT_DEFINED", associationTypeId: typeId }] };
}
