// The sync logic talks to this interface, not to HubSpot directly. HubSpot
// implements it for real; the in-memory version lets anyone run the full flow
// without an account. Swapping CRMs would mean writing one more of these.

export type Props = Record<string, string | number | boolean | undefined>;

export interface ExistingContact {
  id: string;
  properties: Record<string, string | null>;
}

export interface DealSummary {
  id: string;
  pipeline: string;
  stage: string;
  isClosed: boolean;
}

export interface Owner {
  id: string;
  email: string;
  name: string;
}

export interface PipelineRef {
  pipelineId: string;
  newStageId: string;
  closedStageIds: string[];
  label: string;
}

export interface CrmGateway {
  mode: "hubspot" | "demo";
  findContactByEmail(email: string, properties: string[]): Promise<ExistingContact | null>;
  upsertContactByEmail(email: string, props: Props): Promise<string>;
  updateContact(id: string, props: Props): Promise<void>;
  dealsForContact(contactId: string): Promise<DealSummary[]>;
  resolvePipeline(): Promise<PipelineRef>;
  createDeal(props: Props, contactId: string): Promise<string>;
  updateDeal(id: string, props: Props): Promise<void>;
  createNote(html: string, contactId: string, dealId?: string, ownerId?: string): Promise<string>;
  createTask(
    task: { subject: string; body: string; dueAt: Date; priority: "HIGH" | "MEDIUM" | "LOW" },
    contactId: string,
    dealId?: string,
    ownerId?: string,
  ): Promise<string>;
  listOwners(): Promise<Owner[]>;
  recordUrl(kind: "contact" | "deal", id: string): Promise<string | undefined>;
}
