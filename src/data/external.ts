import { assumptions, type PriceArea } from "../config.ts";

// Three free public data sources. Each call is cached and has a fallback, so
// a slow or unavailable API degrades the estimate instead of breaking the form.

const USER_AGENT = "home-energy-estimator-demo/1.0";
const TIMEOUT_MS = 8000;

async function getJson<T>(url: string): Promise<T> {
  const res = await fetch(url, {
    headers: { "User-Agent": USER_AGENT, Accept: "application/json" },
    signal: AbortSignal.timeout(TIMEOUT_MS),
  });
  if (!res.ok) throw new Error(`${res.status} from ${new URL(url).host}`);
  return (await res.json()) as T;
}

// ---------------------------------------------------------------------------
// Postcode -> location (OpenStreetMap Nominatim)

export interface Location {
  lat: number;
  lon: number;
  place: string;
  priceArea: PriceArea;
  source: "nominatim" | "fallback";
}

const locationCache = new Map<string, Location>();

export async function lookupPostcode(postcode: string): Promise<Location> {
  const cached = locationCache.get(postcode);
  if (cached) return cached;

  let location: Location;
  try {
    const url = `https://nominatim.openstreetmap.org/search?postalcode=${postcode}&country=se&format=json&addressdetails=1&limit=1`;
    const results = await getJson<
      { lat: string; lon: string; address?: Record<string, string> }[]
    >(url);
    if (!results.length) throw new Error("postcode not found");
    const r = results[0];
    const lat = Number(r.lat);
    const lon = Number(r.lon);
    const a = r.address ?? {};
    const place = cleanPlace(a.city ?? a.town ?? a.village ?? a.municipality ?? a.county ?? "Sverige");
    location = { lat, lon, place, priceArea: priceAreaFromLatitude(lat), source: "nominatim" };
  } catch {
    // Swedish postcodes run roughly south (1xx Stockholm, 2xx Skåne) to north
    // (9xx Norrland); a coarse guess keeps the flow alive.
    location = { ...fallbackLocation(postcode), source: "fallback" };
  }
  locationCache.set(postcode, location);
  return location;
}

// "Stockholms kommun" -> "Stockholm", "Borås kommun" -> "Borås"
function cleanPlace(name: string): string {
  const base = name.replace(/ kommun$/, "");
  return base === name ? name : base.replace(/([^aeiouyåäöAEIOUYÅÄÖs])s$/, "$1");
}

// Bidding-zone borders follow transmission constraints, not latitude. This
// approximation is right for the large majority of addresses; a production
// version would use the grid operator's postcode-to-area table.
export function priceAreaFromLatitude(lat: number): PriceArea {
  if (lat >= 65.1) return "SE1";
  if (lat >= 61.2) return "SE2";
  if (lat >= 57.0) return "SE3";
  return "SE4";
}

function fallbackLocation(postcode: string): Omit<Location, "source"> {
  const first = Number(postcode[0]);
  const table: Record<number, [number, number, string]> = {
    1: [59.33, 18.06, "Stockholm"],
    2: [55.6, 13.0, "Skåne"],
    3: [56.9, 14.8, "Småland"],
    4: [57.7, 11.97, "Göteborg"],
    5: [57.78, 14.16, "Jönköping"],
    6: [59.38, 15.0, "Mellansverige"],
    7: [59.6, 16.5, "Mälardalen"],
    8: [62.39, 17.3, "Norrland"],
    9: [64.5, 20.5, "Övre Norrland"],
  };
  const [lat, lon, place] = table[first] ?? table[1];
  return { lat, lon, place, priceArea: priceAreaFromLatitude(lat) };
}

// ---------------------------------------------------------------------------
// Live spot prices (elprisetjustnu.se, Nord Pool day-ahead, 15-min resolution)

export interface SpotSnapshot {
  area: PriceArea;
  avgSekPerKwh: number; // excl. VAT
  days: number;
  source: "elprisetjustnu" | "reference";
}

const spotCache = new Map<string, SpotSnapshot>();

export async function recentSpotPrice(area: PriceArea, days = 7): Promise<SpotSnapshot> {
  const today = stockholmDate(new Date());
  const key = `${area}:${today}`;
  const cached = spotCache.get(key);
  if (cached) return cached;

  const dates = Array.from({ length: days }, (_, i) =>
    stockholmDate(new Date(Date.now() - (i + 1) * 86_400_000)),
  );
  const daily = await Promise.allSettled(
    dates.map(async (d) => {
      const [y, m, day] = d.split("-");
      const rows = await getJson<{ SEK_per_kWh: number }[]>(
        `https://www.elprisetjustnu.se/api/v1/prices/${y}/${m}-${day}_${area}.json`,
      );
      return rows.reduce((s, r) => s + r.SEK_per_kWh, 0) / rows.length;
    }),
  );
  const values = daily.flatMap((r) => (r.status === "fulfilled" ? [r.value] : []));

  const snapshot: SpotSnapshot = values.length
    ? {
        area,
        avgSekPerKwh: values.reduce((a, b) => a + b, 0) / values.length,
        days: values.length,
        source: "elprisetjustnu",
      }
    : { area, avgSekPerKwh: assumptions.spotReferenceSekPerKwh[area], days: 0, source: "reference" };
  spotCache.set(key, snapshot);
  return snapshot;
}

function stockholmDate(d: Date): string {
  return d.toLocaleDateString("sv-SE", { timeZone: "Europe/Stockholm" }); // YYYY-MM-DD
}

// ---------------------------------------------------------------------------
// Solar yield (EU JRC PVGIS): kWh per installed kWp per year at this location

export interface SolarYield {
  kwhPerKwp: number;
  source: "pvgis" | "fallback";
}

const solarCache = new Map<string, SolarYield>();

export async function solarYield(lat: number, lon: number): Promise<SolarYield> {
  const key = `${lat.toFixed(1)},${lon.toFixed(1)}`;
  const cached = solarCache.get(key);
  if (cached) return cached;

  const { tiltDegrees, systemLossPercent } = assumptions.solar;
  let result: SolarYield;
  try {
    const url =
      `https://re.jrc.ec.europa.eu/api/v5_3/PVcalc?lat=${lat}&lon=${lon}` +
      `&peakpower=1&loss=${systemLossPercent}&angle=${tiltDegrees}&aspect=0&outputformat=json`;
    const data = await getJson<{ outputs: { totals: { fixed: { E_y: number } } } }>(url);
    result = { kwhPerKwp: data.outputs.totals.fixed.E_y, source: "pvgis" };
  } catch {
    // South Sweden ~1000 kWh/kWp, falling roughly 25 kWh per degree northwards.
    result = { kwhPerKwp: Math.round(1000 - Math.max(0, lat - 56) * 25), source: "fallback" };
  }
  solarCache.set(key, result);
  return result;
}
