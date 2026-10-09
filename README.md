# Hemkalkyl: a homeowner savings estimator with a CRM pipeline behind it

A Swedish homeowner answers eight questions about their house. They get an
honest estimate of what solar, a heat pump and a battery would do to their
energy costs and CO₂, based on **this week's electricity prices in their price
area** and **the measured sunlight at their address**.

Behind the form, the lead lands in HubSpot clean: deduplicated, scored, routed
to the right salesperson, with a deal, an AI-written pre-call brief and a
follow-up task with an SLA that matches how warm the lead is.

> Concept project built as part of a job application. Not affiliated with or
> endorsed by Elvy. Uses the publicly reported subscription price only as a
> comparison point.

## What happens when someone submits

```
Form ──► validate (zod) ──► postcode → location + price area   (OpenStreetMap)
                         ──► last 7 days of spot prices          (elprisetjustnu.se / Nord Pool)
                         ──► solar yield for that location       (EU JRC PVGIS)
                         ──► savings + CO₂ model                 (src/model/estimate.ts)
                         ──► rule-based lead score               (src/model/leadScore.ts)
                         ──► Claude: homeowner summary + sales brief (src/ai/briefs.ts)
                         ──► CRM sync                            (src/crm/sync.ts)
                               1. look up contact by email (dedupe)
                               2. route owner by region, never steal an owned contact
                               3. upsert contact with typed custom properties
                                  (lifecycle only set on new contacts: it can't move backwards)
                               4. one open deal per household: update if it exists,
                                  create only for hot/warm, none for non-homeowners
                               5. attach the sales brief as a note
                               6. follow-up task: hot = within 2h, warm = next day, nurture = 5 days
                               7. Slack-style webhook for hot leads
```

## Design choices

- **Numbers are deterministic; AI only explains them.** The estimate is a
  transparent model with every assumption in `src/config.ts`. Claude writes
  the words around it and is told to use only the numbers it's given.
- **Honest when it doesn't pay off.** A small, new house on district heating
  is told the bundle isn't cheaper today, and stays out of the sales pipeline.
- **The pipeline shows real opportunities only.** Nurture leads stay as contacts
  with a follow-up task instead of becoming deals.
- **Lead scoring is rules, not a model.** Sales can read the reasons on every
  contact and argue with a weight.
- **The CRM data model is code.** `npm run setup:hubspot` creates the property
  group, 19 contact properties, 4 deal properties and the pipeline. It's safe to
  re-run.
- **Nothing breaks if a dependency is down.** Every external call has a
  timeout, a cache and a fallback. With no AI key, template text is used. With
  no HubSpot token, an in-memory CRM with the same behaviour is used.
- **GDPR:** explicit consent checkbox, consent and timestamp stored on the
  contact, and no personal data in URLs.

## Run it

Requires Node 22.18+ (runs TypeScript directly, no build step).

```bash
npm install
npm start
```

Open http://localhost:3000. With no `.env` this is demo mode: everything works
and the "Behind the scenes" panel shows what the CRM sync did.

Run the end-to-end flow (four households, including a repeat submission that
proves dedupe):

```bash
npm run test:flow
```

## Connect a real HubSpot portal

1. Create a free [HubSpot developer account](https://developers.hubspot.com/)
   and a developer test account (or use any portal you own).
2. Create a private app (Settings → Integrations → Private Apps; in newer
   portals it's under Development → Legacy apps) with these scopes:
   `crm.objects.contacts.read/write`, `crm.objects.deals.read/write`,
   `crm.objects.owners.read`, `crm.schemas.contacts.read/write`,
   `crm.schemas.deals.read/write`. If the setup script reports a missing scope,
   add the one it names.
3. Copy `.env.example` to `.env` and paste the token as `HUBSPOT_TOKEN`.
4. `npm run setup:hubspot`
5. `npm start` and submit the form. Each step in "Behind the scenes" links to
   the record in HubSpot.

Add `ANTHROPIC_API_KEY` to get AI-written summaries and briefs. The call uses
structured output (a zod schema), low effort, and server-side refusal
fallbacks.

## Where it would go next

- Booking a site visit from the result page (meetings link on the owner).
- Inbound HubSpot webhooks: when a deal hits "Signed", create the installation
  project and hand over to delivery with the survey data attached.
- Replace the reference spot prices with the company's forward curve, and the
  latitude-based price area with the grid operator's postcode table.
- Nurture sequences segmented by heating type, triggered by `he_lead_tier`.

## Project layout

```
src/config.ts          every assumption, with sources
src/schema.ts          input validation (the CRM only sees clean data)
src/data/external.ts   OpenStreetMap, elprisetjustnu.se, PVGIS
src/model/             savings + CO₂ model, lead scoring
src/ai/briefs.ts       Claude call + template fallback
src/crm/               gateway interface, HubSpot + demo implementations, sync, data model
scripts/               HubSpot setup, end-to-end test
public/                the homeowner page (SV/EN)
```
