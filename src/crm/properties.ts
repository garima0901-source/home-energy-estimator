// The CRM data model, defined once in code. The setup script creates these in
// HubSpot; the sync only writes properties listed here. Prefix "he_" keeps
// custom fields grouped and easy to find (he = home energy).

export const PROPERTY_GROUP = { name: "home_energy_estimator", label: "Home energy estimator" };

export const PIPELINE = {
  label: "Homeowner estimates",
  stages: [
    { label: "New estimate", probability: "0.1" },
    { label: "Contacted", probability: "0.2" },
    { label: "Site visit booked", probability: "0.4" },
    { label: "Proposal sent", probability: "0.6" },
    { label: "Signed", probability: "1.0", isClosed: "true" },
    { label: "Lost", probability: "0.0", isClosed: "true" },
  ],
};

type Option = { label: string; value: string };
const opts = (...values: string[]): Option[] => values.map((v) => ({ label: v, value: v }));

export interface PropertyDef {
  name: string;
  label: string;
  type: "string" | "number" | "enumeration" | "bool" | "datetime";
  fieldType: "text" | "textarea" | "number" | "select" | "booleancheckbox" | "date";
  options?: Option[];
  description?: string;
}

const yesNo: Option[] = [
  { label: "Yes", value: "true" },
  { label: "No", value: "false" },
];

export const CONTACT_PROPERTIES: PropertyDef[] = [
  { name: "he_price_area", label: "Electricity price area", type: "enumeration", fieldType: "select", options: opts("SE1", "SE2", "SE3", "SE4") },
  {
    name: "he_heating_type",
    label: "Current heating",
    type: "enumeration",
    fieldType: "select",
    options: opts("direct_electric", "air_air_hp", "air_water_hp", "ground_source_hp", "oil", "district_heating", "pellets_wood"),
  },
  { name: "he_house_size_m2", label: "House size (m²)", type: "number", fieldType: "number" },
  { name: "he_build_period", label: "Build period", type: "enumeration", fieldType: "select", options: opts("pre1960", "1960_1979", "1980_1999", "2000_plus") },
  { name: "he_residents", label: "Residents", type: "number", fieldType: "number" },
  { name: "he_roof_facing", label: "Roof facing", type: "enumeration", fieldType: "select", options: opts("south", "east_west", "north", "unsure") },
  { name: "he_planning_ev", label: "Planning an EV", type: "bool", fieldType: "booleancheckbox", options: yesNo },
  { name: "he_owns_home", label: "Owns the home", type: "bool", fieldType: "booleancheckbox", options: yesNo },
  { name: "he_timeline", label: "Buying timeline", type: "enumeration", fieldType: "select", options: opts("within_3_months", "within_year", "just_curious") },
  { name: "he_current_cost_sek", label: "Estimated current energy cost (SEK/yr)", type: "number", fieldType: "number" },
  { name: "he_estimated_savings_sek", label: "Estimated savings (SEK/yr)", type: "number", fieldType: "number" },
  { name: "he_co2_reduction_kg", label: "Estimated CO2 reduction (kg/yr)", type: "number", fieldType: "number" },
  { name: "he_lead_score", label: "Estimator lead score", type: "number", fieldType: "number" },
  { name: "he_lead_tier", label: "Estimator lead tier", type: "enumeration", fieldType: "select", options: opts("hot", "warm", "nurture", "not_eligible") },
  { name: "he_estimate_count", label: "Estimates run", type: "number", fieldType: "number", description: "How many times this contact has used the estimator" },
  { name: "he_last_estimate_at", label: "Last estimate at", type: "datetime", fieldType: "date" },
  { name: "he_contact_consent", label: "Consented to contact", type: "bool", fieldType: "booleancheckbox", options: yesNo },
  { name: "he_contact_consent_at", label: "Consent given at", type: "datetime", fieldType: "date" },
  { name: "he_language", label: "Preferred language", type: "enumeration", fieldType: "select", options: opts("sv", "en") },
];

export const DEAL_PROPERTIES: PropertyDef[] = [
  { name: "he_estimated_savings_sek", label: "Estimated savings (SEK/yr)", type: "number", fieldType: "number" },
  { name: "he_lead_tier", label: "Estimator lead tier", type: "enumeration", fieldType: "select", options: opts("hot", "warm", "nurture", "not_eligible") },
  { name: "he_price_area", label: "Electricity price area", type: "enumeration", fieldType: "select", options: opts("SE1", "SE2", "SE3", "SE4") },
  { name: "he_solar_kwp", label: "Proposed solar size (kWp)", type: "number", fieldType: "number" },
];
