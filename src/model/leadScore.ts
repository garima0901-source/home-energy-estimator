import type { EstimateRequest } from "../schema.ts";
import type { Estimate } from "./estimate.ts";

// Rule-based on purpose: sales can read the reasons, argue with them, and
// change a weight without anyone retraining anything.

export type LeadTier = "hot" | "warm" | "nurture" | "not_eligible";

export interface LeadScore {
  score: number;
  tier: LeadTier;
  reasons: string[];
}

export function scoreLead(req: EstimateRequest, est: Estimate): LeadScore {
  const { home, contact } = req;
  if (!home.ownsHome) {
    return { score: 0, tier: "not_eligible", reasons: ["Does not own the home"] };
  }

  const reasons: string[] = [];
  let score = 0;
  const add = (points: number, reason: string) => {
    score += points;
    reasons.push(`${points > 0 ? "+" : ""}${points} ${reason}`);
  };

  const heatingPoints: Record<EstimateRequest["home"]["heatingType"], number> = {
    direct_electric: 25,
    oil: 25,
    air_air_hp: 15,
    pellets_wood: 10,
    district_heating: 5,
    air_water_hp: 5,
    ground_source_hp: 0,
  };
  add(heatingPoints[home.heatingType], `heating: ${home.heatingType}`);

  if (est.annualSavingsSek >= 10_000) add(20, "estimated savings ≥ 10k SEK/yr");
  else if (est.annualSavingsSek >= 3_000) add(10, "estimated savings ≥ 3k SEK/yr");
  else if (est.annualSavingsSek < 0) add(-15, "bundle not cheaper on today's numbers");

  if (home.timeline === "within_3_months") add(25, "wants to act within 3 months");
  else if (home.timeline === "within_year") add(10, "wants to act within a year");

  if (est.inputs.priceArea === "SE3" || est.inputs.priceArea === "SE4") add(10, `high-price area ${est.inputs.priceArea}`);
  if (home.houseSizeM2 >= 130) add(5, "larger house");
  if (home.planningEv) add(5, "planning an EV");
  if (home.roofFacing === "north") add(-10, "north-facing roof");
  if (contact.phone) add(10, "left a phone number");

  score = Math.max(0, Math.min(100, score));
  const tier: LeadTier = score >= 60 ? "hot" : score >= 35 ? "warm" : "nurture";
  return { score, tier, reasons };
}
