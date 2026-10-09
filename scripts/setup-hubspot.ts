// One-time, idempotent HubSpot setup: property groups, custom properties and
// the deal pipeline. Safe to re-run; anything that already exists is skipped.
//
//   npm run setup:hubspot

import { env } from "../src/config.ts";
import { HubSpotClient, HubSpotError } from "../src/crm/hubspot.ts";
import { CONTACT_PROPERTIES, DEAL_PROPERTIES, PIPELINE, PROPERTY_GROUP, type PropertyDef } from "../src/crm/properties.ts";

if (!env.hubspotToken) {
  console.error("Set HUBSPOT_TOKEN in .env first (see README).");
  process.exit(1);
}
const hs = new HubSpotClient(env.hubspotToken);

async function createOrSkip(label: string, fn: () => Promise<unknown>) {
  try {
    await fn();
    console.log(`  ✓ created ${label}`);
  } catch (err) {
    if (err instanceof HubSpotError && err.status === 409) {
      console.log(`  · exists  ${label}`);
    } else {
      console.error(`  ✗ failed  ${label}: ${err instanceof Error ? err.message : err}`);
    }
  }
}

async function setupObject(objectType: "contacts" | "deals", props: PropertyDef[]) {
  console.log(`\n${objectType}`);
  await createOrSkip(`group ${PROPERTY_GROUP.name}`, () =>
    hs.request("POST", `/crm/v3/properties/${objectType}/groups`, { ...PROPERTY_GROUP, displayOrder: -1 }),
  );
  for (const p of props) {
    await createOrSkip(`property ${p.name}`, () =>
      hs.request("POST", `/crm/v3/properties/${objectType}`, {
        ...p,
        groupName: PROPERTY_GROUP.name,
        options: p.options?.map((o, i) => ({ ...o, displayOrder: i, hidden: false })),
      }),
    );
  }
}

async function setupPipeline() {
  console.log("\ndeal pipeline");
  const { results } = await hs.request<{ results: { label: string }[] }>("GET", "/crm/v3/pipelines/deals");
  if (results.some((p) => p.label === PIPELINE.label)) {
    console.log(`  · exists  "${PIPELINE.label}"`);
    return;
  }
  try {
    await hs.request("POST", "/crm/v3/pipelines/deals", {
      label: PIPELINE.label,
      displayOrder: 1,
      stages: PIPELINE.stages.map((s, i) => ({
        label: s.label,
        displayOrder: i,
        metadata: { probability: s.probability, ...("isClosed" in s ? { isClosed: s.isClosed } : {}) },
      })),
    });
    console.log(`  ✓ created "${PIPELINE.label}" with ${PIPELINE.stages.length} stages`);
  } catch (err) {
    // Free portals allow a single deal pipeline. The app then uses the default one.
    console.log(`  ! could not create pipeline (${err instanceof Error ? err.message.slice(0, 120) : err})`);
    console.log("    The app will fall back to your default deal pipeline.");
  }
}

await setupObject("contacts", CONTACT_PROPERTIES);
await setupObject("deals", DEAL_PROPERTIES);
await setupPipeline();
console.log("\nDone.");
