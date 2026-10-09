import { assumptions, env } from "../config.ts";
import type { EstimateRequest } from "../schema.ts";
import type { Estimate } from "../model/estimate.ts";
import type { LeadScore } from "../model/leadScore.ts";
import type { Briefs } from "../ai/briefs.ts";
import type { CrmGateway, Owner } from "./gateway.ts";

// Lead -> CRM in one ordered pass. Each step is logged so the result page
// (and a reviewer) can see exactly what happened and why.

export interface SyncStep {
  action: string;
  detail: string;
  status: "done" | "skipped" | "error";
  url?: string;
}

export interface SyncResult {
  mode: CrmGateway["mode"];
  steps: SyncStep[];
  contactId?: string;
  dealId?: string;
  owner?: Owner;
}

export async function syncLead(
  crm: CrmGateway,
  req: EstimateRequest,
  est: Estimate,
  lead: LeadScore,
  briefs: Briefs,
): Promise<SyncResult> {
  const steps: SyncStep[] = [];
  const result: SyncResult = { mode: crm.mode, steps };
  const log = (s: SyncStep) => steps.push(s);
  const { contact, home } = req;
  const now = new Date();

  try {
    // 1. Dedupe: email is the identity. A returning homeowner updates their
    //    record; they never become a second contact.
    const existing = await crm.findContactByEmail(contact.email, ["he_estimate_count", "hubspot_owner_id", "lifecyclestage"]);
    const estimateCount = Number(existing?.properties.he_estimate_count ?? 0) + 1;
    log({
      action: "Look up contact by email",
      detail: existing ? `Found existing contact #${existing.id} (this is estimate #${estimateCount})` : "No match, so this is a new contact",
      status: "done",
    });

    // 2. Route to an owner by region, but never steal a contact someone already owns.
    const owners = await crm.listOwners();
    const existingOwnerId = existing?.properties.hubspot_owner_id || undefined;
    const owner = existingOwnerId ? owners.find((o) => o.id === existingOwnerId) : routeOwner(owners, est.inputs.priceArea);
    result.owner = owner;
    log({
      action: "Assign owner",
      detail: existingOwnerId
        ? `Kept existing owner ${owner?.name ?? existingOwnerId}`
        : owner
          ? `Routed to ${owner.name} for price area ${est.inputs.priceArea}`
          : "No owners in the portal, so left unassigned",
      status: owner || existingOwnerId ? "done" : "skipped",
    });

    // 3. Upsert the contact with clean, typed properties.
    const contactId = await crm.upsertContactByEmail(contact.email, {
      firstname: contact.firstName,
      lastname: contact.lastName,
      phone: contact.phone, // undefined = don't overwrite a number we already have
      zip: home.postcode,
      city: est.inputs.place,
      hubspot_owner_id: existingOwnerId ? undefined : owner?.id,
      he_price_area: est.inputs.priceArea,
      he_heating_type: home.heatingType,
      he_house_size_m2: home.houseSizeM2,
      he_build_period: home.buildPeriod,
      he_residents: home.residents,
      he_roof_facing: home.roofFacing,
      he_planning_ev: home.planningEv,
      he_owns_home: home.ownsHome,
      he_timeline: home.timeline,
      he_current_cost_sek: est.today.totalCostSek,
      he_estimated_savings_sek: est.annualSavingsSek,
      he_co2_reduction_kg: est.co2ReductionKg,
      he_lead_score: lead.score,
      he_lead_tier: lead.tier,
      he_estimate_count: estimateCount,
      he_last_estimate_at: now.toISOString(),
      he_contact_consent: true,
      he_contact_consent_at: now.toISOString(),
      he_language: req.language,
    });
    result.contactId = contactId;
    // Lifecycle stage can only move forward in HubSpot, so only set it on new contacts.
    if (!existing) {
      await crm.updateContact(contactId, {
        lifecyclestage: "lead",
        hs_lead_status: lead.tier === "not_eligible" ? "UNQUALIFIED" : "NEW",
      });
    }
    log({
      action: existing ? "Update contact" : "Create contact",
      detail: `${contact.firstName} ${contact.lastName}, score ${lead.score} (${lead.tier})${existing ? "" : lead.tier === "not_eligible" ? ", lead status = unqualified" : ", lifecycle = lead"}`,
      status: "done",
      url: await crm.recordUrl("contact", contactId),
    });

    // 4. Deal: at most one open deal per household. Only hot and warm leads
    //    enter the sales pipeline; nurture leads stay as contacts so the
    //    pipeline reflects real opportunities. An existing open deal is
    //    always kept up to date, whatever the new score.
    if (lead.tier === "not_eligible") {
      log({ action: "Deal", detail: "Skipped: not a homeowner, so the bundle doesn’t apply. Kept as a contact only.", status: "skipped" });
      return result;
    }
    const pipeline = await crm.resolvePipeline();
    const openDeal = (await crm.dealsForContact(contactId)).find(
      (d) => d.pipeline === pipeline.pipelineId && !d.isClosed && !pipeline.closedStageIds.includes(d.stage),
    );
    const dealProps = {
      dealname: `${contact.lastName}, ${est.inputs.place}: ${est.withBundle.solarKwp} kWp + heat pump + battery`,
      amount: assumptions.subscriptionSekPerMonth * 12 * assumptions.subscriptionYears,
      he_estimated_savings_sek: est.annualSavingsSek,
      he_lead_tier: lead.tier,
      he_price_area: est.inputs.priceArea,
      he_solar_kwp: est.withBundle.solarKwp,
    };
    let dealId: string | undefined;
    if (openDeal) {
      dealId = openDeal.id;
      await crm.updateDeal(dealId, dealProps); // keep its stage: sales may have moved it on
      log({
        action: "Update deal",
        detail: `Open deal #${dealId} already exists, so updated it with the new estimate instead of creating a duplicate`,
        status: "done",
        url: await crm.recordUrl("deal", dealId),
      });
    } else if (lead.tier === "nurture") {
      log({ action: "Deal", detail: "Not created: nurture lead. Stays out of the sales pipeline until they re-engage.", status: "skipped" });
    } else {
      dealId = await crm.createDeal(
        { ...dealProps, pipeline: pipeline.pipelineId, dealstage: pipeline.newStageId, hubspot_owner_id: owner?.id },
        contactId,
      );
      log({
        action: "Create deal",
        detail: `"${dealProps.dealname}" in "${pipeline.label}", first stage, contract value ${dealProps.amount.toLocaleString("sv-SE")} kr`,
        status: "done",
        url: await crm.recordUrl("deal", dealId),
      });
    }
    result.dealId = dealId;

    // 5. The AI pre-call brief goes where the salesperson already works.
    await crm.createNote(briefNoteHtml(est, lead, briefs, req.home.notes), contactId, dealId, owner?.id);
    log({
      action: "Attach sales brief",
      detail: `${briefs.generatedBy === "claude" ? "AI-written" : "Template"} brief with motivations, objections and an opening line`,
      status: "done",
    });

    // 6. A follow-up task with an SLA that matches the lead's temperature.
    const sla = {
      hot: { days: 0, subject: "Call: hot estimator lead", priority: "HIGH" },
      warm: { days: 1, subject: "Call: estimator lead", priority: "MEDIUM" },
      nurture: { days: 5, subject: "Email: send estimate summary + check in", priority: "LOW" },
    } as const;
    const plan = sla[lead.tier];
    const dueAt = businessDaysFrom(now, plan.days);
    await crm.createTask(
      {
        subject: `${plan.subject}: ${contact.firstName} ${contact.lastName}`,
        body: briefs.salesBrief.nextBestAction,
        dueAt,
        priority: plan.priority,
      },
      contactId,
      dealId,
      owner?.id,
    );
    log({
      action: "Create follow-up task",
      detail: `${plan.priority} priority, due ${dueAt.toLocaleString("sv-SE", { timeZone: "Europe/Stockholm", dateStyle: "short", timeStyle: "short" })} for ${owner?.name ?? "unassigned"}`,
      status: "done",
    });

    // 7. Hot leads also ping the team channel (Slack-compatible webhook).
    if (lead.tier === "hot" && env.notifyWebhookUrl) {
      const res = await fetch(env.notifyWebhookUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          text: `🔥 Hot estimator lead: ${briefs.salesBrief.oneLiner} (owner: ${owner?.name ?? "unassigned"})`,
        }),
        signal: AbortSignal.timeout(5000),
      });
      log({ action: "Notify team channel", detail: `Webhook responded ${res.status}`, status: res.ok ? "done" : "error" });
    } else if (lead.tier === "hot") {
      log({ action: "Notify team channel", detail: "No NOTIFY_WEBHOOK_URL configured", status: "skipped" });
    }
  } catch (err) {
    console.error("CRM sync failed:", err);
    log({ action: "CRM sync", detail: err instanceof Error ? err.message : String(err), status: "error" });
  }
  return result;
}

function routeOwner(owners: Owner[], area: string): Owner | undefined {
  const configured = env.ownerRouting[area];
  if (configured) return owners.find((o) => o.id === configured);
  if (!owners.length) return undefined;
  const regionIndex = { SE1: 0, SE2: 0, SE3: 1, SE4: 2 }[area] ?? 0;
  return owners[regionIndex % owners.length];
}

// Next business day(s) at 10:00 Stockholm time; "0 days" means today if it's
// a weekday morning, otherwise the next business morning.
function businessDaysFrom(from: Date, days: number): Date {
  const d = new Date(from);
  const hourInStockholm = Number(d.toLocaleString("en-GB", { timeZone: "Europe/Stockholm", hour: "2-digit", hour12: false }));
  let remaining = days === 0 && hourInStockholm < 14 && isWeekday(d) ? 0 : Math.max(days, 1);
  if (remaining === 0) {
    return new Date(d.getTime() + 2 * 3_600_000); // within two hours
  }
  while (remaining > 0) {
    d.setUTCDate(d.getUTCDate() + 1);
    if (isWeekday(d)) remaining--;
  }
  d.setUTCHours(8, 0, 0, 0); // 10:00 CEST / 09:00 CET
  return d;
}

const isWeekday = (d: Date) => d.getUTCDay() !== 0 && d.getUTCDay() !== 6;

function briefNoteHtml(est: Estimate, lead: LeadScore, b: Briefs, homeownerNote?: string): string {
  const esc = (s: string) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
  const li = (items: string[]) => `<ul>${items.map((i) => `<li>${esc(i)}</li>`).join("")}</ul>`;
  const kr = (n: number) => `${n.toLocaleString("sv-SE")} kr`;
  const s = b.salesBrief;
  return [
    `<p><strong>Estimator brief</strong> (${b.generatedBy === "claude" ? "AI-generated" : "template"})</p>`,
    `<p>${esc(s.oneLiner)}</p>`,
    homeownerNote ? `<p><strong>In their words:</strong> "${esc(homeownerNote)}"</p>` : "",
    `<p><strong>Numbers:</strong> today ${kr(est.today.totalCostSek)}/yr → with bundle ${kr(est.withBundle.totalCostSek)}/yr. Savings ${kr(est.annualSavingsSek)}/yr (${est.savingsPercent}%). CO2 −${est.co2ReductionKg} kg/yr. Solar ${est.withBundle.solarKwp} kWp.</p>`,
    `<p><strong>Why they might buy</strong></p>${li(s.motivations)}`,
    `<p><strong>Likely objections</strong></p>${li(s.likelyObjections.map((o) => `${o.objection}: ${o.suggestedResponse}`))}`,
    `<p><strong>Opening line:</strong> ${esc(s.openingLine)}</p>`,
    `<p><strong>Next best action:</strong> ${esc(s.nextBestAction)}</p>`,
    `<p><strong>Lead score ${lead.score} (${lead.tier})</strong></p>${li(lead.reasons)}`,
    s.dataQualityFlags.length ? `<p><strong>Check on the call</strong></p>${li(s.dataQualityFlags)}` : "",
  ].join("");
}
