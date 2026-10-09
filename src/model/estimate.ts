import { assumptions as A, type PriceArea } from "../config.ts";
import type { EstimateRequest } from "../schema.ts";
import type { Location, SolarYield, SpotSnapshot } from "../data/external.ts";

// A deliberately transparent model: every step is a line a salesperson could
// explain to a homeowner. It is an indicative estimate, not a quote.

export interface Estimate {
  inputs: {
    priceArea: PriceArea;
    place: string;
    heatDemandKwh: number;
    householdKwh: number;
    fullElectricityPriceSekPerKwh: number;
  };
  today: {
    heatingCostSek: number;
    householdElectricityCostSek: number;
    totalCostSek: number;
    co2Kg: number;
  };
  withBundle: {
    heatPumpKwh: number;
    solarKwp: number;
    solarProductionKwh: number;
    selfUsedKwh: number;
    exportedKwh: number;
    gridPurchaseKwh: number;
    energyBillSek: number;
    exportIncomeSek: number;
    subscriptionSek: number;
    totalCostSek: number;
    co2Kg: number;
  };
  annualSavingsSek: number;
  savingsPercent: number;
  co2ReductionKg: number;
  live: {
    spotLast7DaysSekPerKwh: number;
    spotSource: SpotSnapshot["source"];
    solarKwhPerKwp: number;
    solarSource: SolarYield["source"];
    locationSource: Location["source"];
  };
  flags: string[]; // honest caveats, shown to the homeowner and logged in the CRM
}

export function fullElectricityPrice(spot: number): number {
  return (spot + A.supplierMarkupSekPerKwh + A.gridEnergyFeeSekPerKwh + A.energyTaxSekPerKwh) * (1 + A.vat);
}

export function estimateSavings(
  home: EstimateRequest["home"],
  location: Location,
  spot: SpotSnapshot,
  solar: SolarYield,
): Estimate {
  const flags: string[] = [];
  const area = location.priceArea;
  const spotRef = A.spotReferenceSekPerKwh[area];
  const price = fullElectricityPrice(spotRef);

  // 1. How much heat does the house need?
  const heatDemand =
    home.houseSizeM2 * A.spaceHeatKwhPerM2[home.buildPeriod] + home.residents * A.hotWaterKwhPerResident;

  // 2. What does heating cost today?
  const heating = A.heating[home.heatingType];
  let heatingCost: number;
  let heatingElectricity = 0;
  let heatingCo2: number;
  if (heating.kind === "electric") {
    heatingElectricity = heatDemand / heating.efficiency;
    heatingCost = heatingElectricity * price;
    heatingCo2 = heatingElectricity * heating.co2KgPerKwhInput;
  } else {
    heatingCost = heatDemand * heating.costSekPerKwhHeat;
    heatingCo2 = heatDemand * heating.co2KgPerKwhHeat;
  }

  // 3. Household electricity (lights, appliances, EV). If the homeowner gave
  // their total annual use, back out the heating share instead of guessing.
  const evKwh = home.planningEv ? A.evChargingKwh : 0;
  let household = A.householdBaseKwh + home.residents * A.householdKwhPerResident;
  if (home.annualKwh) {
    const implied = home.annualKwh - heatingElectricity;
    if (implied < A.minHouseholdKwh) {
      flags.push("reported_kwh_low_vs_heat_estimate");
    } else {
      household = implied;
    }
  }
  household = Math.max(household, A.minHouseholdKwh) + evKwh;
  const householdCost = household * price;
  const todayTotal = heatingCost + householdCost;

  // 4. The bundle: heat pump covers heat, solar + battery offsets purchases.
  const scop = home.heatingType === "ground_source_hp" ? A.groundSourceUpgradeScop : A.newHeatPumpScop;
  const heatPumpKwh = heatDemand / scop;
  const roofFactor = A.solar.roofFactor[home.roofFacing];
  const kwp = roofFactor === 0 ? 0 : clamp(home.houseSizeM2 / A.solar.m2PerKwp, A.solar.minKwp, A.solar.maxKwp);
  if (roofFactor === 0) flags.push("north_facing_roof_no_solar");
  const production = kwp * solar.kwhPerKwp * roofFactor;
  const demand = heatPumpKwh + household;
  const selfUsed = Math.min(production * A.selfConsumptionShareWithBattery, demand);
  const exported = production - selfUsed;
  const gridPurchase = demand - selfUsed;
  const energyBill = gridPurchase * price;
  const exportIncome = exported * spotRef * A.exportPriceFactor;
  const subscription = A.subscriptionSekPerMonth * 12;
  const bundleTotal = energyBill - exportIncome + subscription;

  const savings = todayTotal - bundleTotal;
  const todayCo2 = heatingCo2 + household * A.gridCo2KgPerKwh;
  const bundleCo2 = gridPurchase * A.gridCo2KgPerKwh;

  if (savings < 0) flags.push("bundle_not_cheaper_today");
  if (home.heatingType === "ground_source_hp") flags.push("already_has_ground_source_hp");
  if (location.source === "fallback") flags.push("postcode_not_geocoded");
  if (!home.ownsHome) flags.push("not_homeowner");

  return {
    inputs: {
      priceArea: area,
      place: location.place,
      heatDemandKwh: round(heatDemand),
      householdKwh: round(household),
      fullElectricityPriceSekPerKwh: Math.round(price * 100) / 100,
    },
    today: {
      heatingCostSek: round(heatingCost),
      householdElectricityCostSek: round(householdCost),
      totalCostSek: round(todayTotal),
      co2Kg: round(todayCo2),
    },
    withBundle: {
      heatPumpKwh: round(heatPumpKwh),
      solarKwp: Math.round(kwp * 10) / 10,
      solarProductionKwh: round(production),
      selfUsedKwh: round(selfUsed),
      exportedKwh: round(exported),
      gridPurchaseKwh: round(gridPurchase),
      energyBillSek: round(energyBill),
      exportIncomeSek: round(exportIncome),
      subscriptionSek: subscription,
      totalCostSek: round(bundleTotal),
      co2Kg: round(bundleCo2),
    },
    annualSavingsSek: round(savings),
    savingsPercent: Math.round((savings / todayTotal) * 100),
    co2ReductionKg: round(todayCo2 - bundleCo2),
    live: {
      spotLast7DaysSekPerKwh: Math.round(spot.avgSekPerKwh * 100) / 100,
      spotSource: spot.source,
      solarKwhPerKwp: Math.round(solar.kwhPerKwp),
      solarSource: solar.source,
      locationSource: location.source,
    },
    flags,
  };
}

const clamp = (v: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, v));
const round = (v: number) => Math.round(v / 10) * 10;
