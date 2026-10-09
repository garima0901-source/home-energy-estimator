// Every number the estimate depends on lives here, so a reviewer can audit
// (and an energy analyst can replace) the assumptions in one place.
// All prices are SEK. "kWh heat" = useful heat delivered to the house.

try {
  process.loadEnvFile(new URL("../.env", import.meta.url));
} catch {
  // No .env file: run in demo mode with defaults.
}

export const env = {
  port: Number(process.env.PORT ?? 3000),
  hubspotToken: process.env.HUBSPOT_TOKEN?.trim() || undefined,
  anthropicKey: process.env.ANTHROPIC_API_KEY?.trim() || undefined,
  claudeModel: process.env.CLAUDE_MODEL?.trim() || "claude-opus-5-5",
  notifyWebhookUrl: process.env.NOTIFY_WEBHOOK_URL?.trim() || undefined,
  // e.g. {"SE1":"12345","SE2":"12345","SE3":"67890","SE4":"67890"}
  ownerRouting: parseJson<Record<string, string>>(process.env.OWNER_ROUTING) ?? {},
  salesBriefLanguage: (process.env.SALES_BRIEF_LANGUAGE === "sv" ? "sv" : "en") as "sv" | "en",
};

function parseJson<T>(raw: string | undefined): T | undefined {
  if (!raw) return undefined;
  try {
    return JSON.parse(raw) as T;
  } catch {
    console.warn("Ignoring invalid JSON in environment variable");
    return undefined;
  }
}

export const PRICE_AREAS = ["SE1", "SE2", "SE3", "SE4"] as const;
export type PriceArea = (typeof PRICE_AREAS)[number];

export const assumptions = {
  // --- Electricity price build-up (SEK/kWh) ---------------------------------
  // Reference annual average spot price per bidding zone. Rough recent-year
  // levels; replace with the company's own forward curve.
  spotReferenceSekPerKwh: { SE1: 0.3, SE2: 0.32, SE3: 0.75, SE4: 0.95 } satisfies Record<PriceArea, number>,
  supplierMarkupSekPerKwh: 0.06,
  gridEnergyFeeSekPerKwh: 0.25, // variable part of the grid tariff only
  energyTaxSekPerKwh: 0.36, // excl. VAT, 2026 level; verify against Skatteverket
  vat: 0.25,

  // --- Heat demand ----------------------------------------------------------
  // Space heating, kWh heat per m² per year, by construction period.
  spaceHeatKwhPerM2: {
    pre1960: 150,
    "1960_1979": 135,
    "1980_1999": 110,
    "2000_plus": 80,
  },
  hotWaterKwhPerResident: 1000,

  // --- Household (non-heating) electricity -----------------------------------
  householdBaseKwh: 1500,
  householdKwhPerResident: 900,
  evChargingKwh: 2500,
  minHouseholdKwh: 2000,

  // --- Current heating systems ----------------------------------------------
  // For electric systems: seasonal efficiency (kWh heat per kWh electricity).
  // For fuels/district heating: cost per kWh of delivered heat.
  heating: {
    direct_electric: { kind: "electric", efficiency: 1.0, co2KgPerKwhInput: 0.04 },
    air_air_hp: { kind: "electric", efficiency: 1.8, co2KgPerKwhInput: 0.04 },
    air_water_hp: { kind: "electric", efficiency: 2.6, co2KgPerKwhInput: 0.04 },
    ground_source_hp: { kind: "electric", efficiency: 3.2, co2KgPerKwhInput: 0.04 },
    oil: { kind: "fuel", costSekPerKwhHeat: 1.75, co2KgPerKwhHeat: 0.34 },
    district_heating: { kind: "fuel", costSekPerKwhHeat: 1.05, co2KgPerKwhHeat: 0.06 },
    pellets_wood: { kind: "fuel", costSekPerKwhHeat: 0.85, co2KgPerKwhHeat: 0.03 },
  },

  // --- The bundle: heat pump + solar + battery -------------------------------
  newHeatPumpScop: 3.0, // modern air-to-water, seasonal average for Swedish climate
  groundSourceUpgradeScop: 3.6, // if the home already has ground source, assume a modern replacement
  solar: {
    minKwp: 6,
    maxKwp: 12,
    m2PerKwp: 15, // rough sizing: 150 m² house -> 10 kWp
    tiltDegrees: 30,
    systemLossPercent: 14,
    roofFactor: { south: 1.0, east_west: 0.85, unsure: 0.9, north: 0 },
  },
  selfConsumptionShareWithBattery: 0.5, // share of solar output used in the home
  exportPriceFactor: 0.9, // export earns ~spot minus supplier fee

  // Publicly reported price of Elvy's subscription (Sifted / Tech.eu).
  // Used only as an illustrative comparison point.
  subscriptionSekPerMonth: 2500,
  subscriptionYears: 15,

  // Swedish electricity production mix, kg CO2e per kWh (used for the ESG view).
  gridCo2KgPerKwh: 0.04,
} as const;

export type HeatingType = keyof typeof assumptions.heating;
export type BuildPeriod = keyof typeof assumptions.spaceHeatKwhPerM2;
export type RoofFacing = keyof typeof assumptions.solar.roofFactor;
