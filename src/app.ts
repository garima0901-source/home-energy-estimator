import path from "node:path";
import express from "express";
import { z } from "zod";
import { env } from "./config.ts";
import { estimateRequestSchema } from "./schema.ts";
import { lookupPostcode, recentSpotPrice, solarYield } from "./data/external.ts";
import { estimateSavings } from "./model/estimate.ts";
import { scoreLead } from "./model/leadScore.ts";
import { generateBriefs } from "./ai/briefs.ts";
import { syncLead } from "./crm/sync.ts";
import { HubSpotGateway } from "./crm/hubspot.ts";
import { DemoGateway } from "./crm/demo.ts";
import type { CrmGateway } from "./crm/gateway.ts";

const crm: CrmGateway = env.hubspotToken ? new HubSpotGateway(env.hubspotToken) : new DemoGateway();

const app = express();
app.set("trust proxy", 1);
app.use(express.json({ limit: "20kb" }));
app.use(express.static(path.join(import.meta.dirname, "..", "public")));

// A public form needs basic abuse protection: 10 estimates per IP per 10 min.
const hits = new Map<string, number[]>();
function rateLimited(ip: string): boolean {
  const now = Date.now();
  const recent = (hits.get(ip) ?? []).filter((t) => now - t < 600_000);
  recent.push(now);
  hits.set(ip, recent);
  return recent.length > 10;
}

app.get("/api/status", (_req, res) => {
  res.json({ crm: crm.mode, ai: env.anthropicKey ? "claude" : "template" });
});

app.post("/api/estimate", async (req, res) => {
  if (rateLimited(req.ip ?? "unknown")) {
    res.status(429).json({ error: "Too many requests, try again in a few minutes." });
    return;
  }
  const parsed = estimateRequestSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Invalid input", fields: z.flattenError(parsed.error).fieldErrors, details: parsed.error.issues });
    return;
  }
  const input = parsed.data;

  try {
    const location = await lookupPostcode(input.home.postcode);
    const [spot, solar] = await Promise.all([
      recentSpotPrice(location.priceArea),
      solarYield(location.lat, location.lon),
    ]);
    const estimate = estimateSavings(input.home, location, spot, solar);
    const lead = scoreLead(input, estimate);
    const briefs = await generateBriefs(input, estimate, lead);
    const crmResult = await syncLead(crm, input, estimate, lead, briefs);

    res.json({
      estimate,
      homeowner: briefs.homeowner,
      // Everything below is what a salesperson sees. It's returned here only
      // so the demo can show the CRM side; a production form would not.
      behindTheScenes: {
        generatedBy: briefs.generatedBy,
        lead,
        salesBrief: briefs.salesBrief,
        crm: crmResult,
      },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Something went wrong while calculating your estimate." });
  }
});

// Demo mode only: inspect the in-memory CRM.
app.get("/api/demo-crm", (_req, res) => {
  if (!(crm instanceof DemoGateway)) {
    res.status(404).end();
    return;
  }
  res.json({
    contacts: [...crm.contacts.values()],
    deals: [...crm.deals.values()],
    notes: crm.notes.length,
    tasks: crm.tasks,
  });
});

export default app;
