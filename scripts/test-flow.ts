// End-to-end check against a running server: three homeowners, then the
// first one again to prove dedupe (same contact, same deal, updated).
//
//   npm start            (in one terminal)
//   npm run test:flow    (in another)

const BASE = process.env.BASE_URL ?? "http://localhost:3000";

const homes = [
  {
    label: "Hot: direct electric, Stockholm, acting soon",
    body: {
      language: "en",
      home: { postcode: "16440", houseSizeM2: 150, buildPeriod: "1960_1979", heatingType: "direct_electric", residents: 4, roofFacing: "south", planningEv: true, ownsHome: true, timeline: "within_3_months", notes: "Our winter bills were awful last year. Roof was replaced 2019." },
      contact: { firstName: "Karin", lastName: "Lindqvist", email: "karin.test@example.com", phone: "070-123 45 67", consent: true },
    },
  },
  {
    label: "Nurture: district heating, Gothenburg, curious",
    body: {
      language: "sv",
      home: { postcode: "41319", houseSizeM2: 110, buildPeriod: "2000_plus", heatingType: "district_heating", residents: 2, roofFacing: "east_west", planningEv: false, ownsHome: true, timeline: "just_curious" },
      contact: { firstName: "Johan", lastName: "Berg", email: "johan.test@example.com", consent: true },
    },
  },
  {
    label: "Not eligible: renter in Malmö",
    body: {
      language: "sv",
      home: { postcode: "21145", houseSizeM2: 90, buildPeriod: "pre1960", heatingType: "oil", residents: 3, roofFacing: "unsure", planningEv: false, ownsHome: false, timeline: "within_year" },
      contact: { firstName: "Leila", lastName: "Haddad", email: "leila.test@example.com", consent: true },
    },
  },
];

async function run(label: string, body: unknown) {
  const res = await fetch(`${BASE}/api/estimate`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  const json = await res.json();
  if (!res.ok) throw new Error(`${label}: ${res.status} ${JSON.stringify(json)}`);
  const { estimate: e, behindTheScenes: b, homeowner } = json;
  console.log(`\n=== ${label}`);
  console.log(`  ${e.inputs.place} ${e.inputs.priceArea} | today ${e.today.totalCostSek} kr → bundle ${e.withBundle.totalCostSek} kr | saves ${e.annualSavingsSek} kr (${e.savingsPercent}%) | CO2 −${e.co2ReductionKg} kg`);
  console.log(`  lead ${b.lead.score} (${b.lead.tier}) | text by ${b.generatedBy}`);
  console.log(`  homeowner: ${homeowner.headline}`);
  for (const s of b.crm.steps) console.log(`  [${s.status}] ${s.action}: ${s.detail}`);
  return json;
}

for (const h of homes) await run(h.label, h.body);
await run("Repeat: Karin runs it again (should update, not duplicate)", {
  ...homes[0].body,
  home: { ...homes[0].body.home, houseSizeM2: 160 },
});

const demo = await fetch(`${BASE}/api/demo-crm`);
if (demo.ok) {
  const d = await demo.json();
  console.log(`\nDemo CRM now holds ${d.contacts.length} contacts, ${d.deals.length} deals, ${d.notes} notes, ${d.tasks.length} tasks.`);
}
