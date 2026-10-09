import { z } from "zod";

// One schema for everything the homeowner submits. The CRM only ever sees
// data that passed through here, which is what keeps HubSpot clean.

const swedishPostcode = z
  .string()
  .transform((s) => s.replace(/\s+/g, ""))
  .pipe(z.string().regex(/^\d{5}$/, "Postcode must be 5 digits"));

const swedishPhone = z
  .string()
  .transform((s) => s.replace(/[\s\-()]/g, ""))
  .transform((s) => (s.startsWith("0") ? "+46" + s.slice(1) : s))
  .pipe(z.string().regex(/^\+\d{8,15}$/, "Invalid phone number"));

export const estimateRequestSchema = z.object({
  language: z.enum(["sv", "en"]).default("sv"),
  home: z.object({
    postcode: swedishPostcode,
    houseSizeM2: z.coerce.number().int().min(40).max(500),
    buildPeriod: z.enum(["pre1960", "1960_1979", "1980_1999", "2000_plus"]),
    heatingType: z.enum([
      "direct_electric",
      "air_air_hp",
      "air_water_hp",
      "ground_source_hp",
      "oil",
      "district_heating",
      "pellets_wood",
    ]),
    residents: z.coerce.number().int().min(1).max(10),
    annualKwh: z.coerce.number().int().min(1000).max(60000).optional(),
    roofFacing: z.enum(["south", "east_west", "north", "unsure"]),
    planningEv: z.boolean().default(false),
    ownsHome: z.boolean(),
    timeline: z.enum(["within_3_months", "within_year", "just_curious"]),
    notes: z.string().trim().max(500).optional(),
  }),
  contact: z.object({
    firstName: z.string().trim().min(1).max(80),
    lastName: z.string().trim().min(1).max(80),
    email: z.string().trim().toLowerCase().pipe(z.email()),
    phone: z.union([swedishPhone, z.literal("").transform(() => undefined)]).optional(),
    consent: z.literal(true, { message: "Consent is required" }),
  }),
});

export type EstimateRequest = z.infer<typeof estimateRequestSchema>;
