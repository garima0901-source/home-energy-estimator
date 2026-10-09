import { randomInt } from "node:crypto";
import { PIPELINE } from "./properties.ts";
import type { CrmGateway, DealSummary, ExistingContact, Owner, PipelineRef, Props } from "./gateway.ts";

// In-memory CRM with the same behaviour as the HubSpot gateway (upsert by
// email, deal associations, closed stages). Data lives until restart.

const id = () => String(randomInt(10_000_000, 99_999_999));

export class DemoGateway implements CrmGateway {
  mode = "demo" as const;
  contacts = new Map<string, { id: string; properties: Record<string, string> }>();
  deals = new Map<string, { id: string; contactId: string; properties: Record<string, string> }>();
  notes: { id: string; contactId: string; dealId?: string; html: string }[] = [];
  tasks: { id: string; contactId: string; dealId?: string; subject: string; ownerId?: string }[] = [];

  #pipeline: PipelineRef = {
    pipelineId: "demo-pipeline",
    label: PIPELINE.label,
    newStageId: "new_estimate",
    closedStageIds: ["signed", "lost"],
  };
  #owners: Owner[] = [
    { id: "101", email: "anna@example.com", name: "Anna (North)" },
    { id: "102", email: "erik@example.com", name: "Erik (Stockholm)" },
    { id: "103", email: "sara@example.com", name: "Sara (South)" },
  ];

  async findContactByEmail(email: string): Promise<ExistingContact | null> {
    const c = [...this.contacts.values()].find((c) => c.properties.email === email);
    return c ? { id: c.id, properties: { ...c.properties } } : null;
  }

  async upsertContactByEmail(email: string, props: Props): Promise<string> {
    const existing = await this.findContactByEmail(email);
    const contactId = existing?.id ?? id();
    const prev = this.contacts.get(contactId)?.properties ?? {};
    this.contacts.set(contactId, { id: contactId, properties: { ...prev, ...strings(props), email } });
    return contactId;
  }

  async updateContact(contactId: string, props: Props): Promise<void> {
    const c = this.contacts.get(contactId);
    if (c) Object.assign(c.properties, strings(props));
  }

  async dealsForContact(contactId: string): Promise<DealSummary[]> {
    return [...this.deals.values()]
      .filter((d) => d.contactId === contactId)
      .map((d) => ({
        id: d.id,
        pipeline: d.properties.pipeline,
        stage: d.properties.dealstage,
        isClosed: this.#pipeline.closedStageIds.includes(d.properties.dealstage),
      }));
  }

  async resolvePipeline(): Promise<PipelineRef> {
    return this.#pipeline;
  }

  async createDeal(props: Props, contactId: string): Promise<string> {
    const dealId = id();
    this.deals.set(dealId, { id: dealId, contactId, properties: strings(props) });
    return dealId;
  }

  async updateDeal(dealId: string, props: Props): Promise<void> {
    const d = this.deals.get(dealId);
    if (d) Object.assign(d.properties, strings(props));
  }

  async createNote(html: string, contactId: string, dealId?: string): Promise<string> {
    const noteId = id();
    this.notes.push({ id: noteId, contactId, dealId, html });
    return noteId;
  }

  async createTask(task: { subject: string }, contactId: string, dealId?: string, ownerId?: string): Promise<string> {
    const taskId = id();
    this.tasks.push({ id: taskId, contactId, dealId, subject: task.subject, ownerId });
    return taskId;
  }

  async listOwners(): Promise<Owner[]> {
    return this.#owners;
  }

  async recordUrl(): Promise<string | undefined> {
    return undefined;
  }
}

function strings(props: Props): Record<string, string> {
  return Object.fromEntries(
    Object.entries(props)
      .filter(([, v]) => v !== undefined)
      .map(([k, v]) => [k, String(v)]),
  );
}
