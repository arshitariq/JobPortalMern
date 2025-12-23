import { z } from "zod";

/** ---------- Shared Lists ---------- */
export const organizationTypes = [
  "development",
  "business",
  "finance & accounting",
  "it & software",
  "office productivity",
  "personal development",
  "design",
  "marketing",
  "photography & video",
  "healthcare",
  "education",
  "retail",
  "manufacturing",
  "hospitality",
  "consulting",
  "real estate",
  "legal",
  "other",
];

export const teamSizes = ["1-10", "11-50", "51-200", "201-500", "501-1000", "1000+"];

/** ---------- Settings/Profile Schema (separate screen) ---------- */
export const employerProfileSchema = z.object({
  name: z.string().min(2, "Company name must be at least 2 characters"),
  description: z.string().min(10, "Description must be at least 10 characters").max(2000),
  organizationType: z.enum(organizationTypes),
  teamSize: z.enum(teamSizes),
  yearOfEstablishment: z
    .string()
    .regex(/^\d{4}$/, "Enter 4 digit year")
    .refine((y) => {
      const n = Number(y);
      const now = new Date().getFullYear();
      return n >= 1800 && n <= now;
    }, "Year must be between 1800 and current year"),
  websiteUrl: z.string().url("Enter valid URL").optional().or(z.literal("")),
  location: z.string().min(2, "Location is required").optional().or(z.literal("")),
});

/** ---------- Phone Rules ---------- */
const PHONE_RULES = {
  uae: { label: "UAE", code: "+971", digits: 9 },
  uk: { label: "UK", code: "+44", digits: 10 },
  usa: { label: "USA", code: "+1", digits: 10 },
  saudi: { label: "Saudi Arabia", code: "+966", digits: 9 },
  india: { label: "India", code: "+91", digits: 10 },
  china: { label: "China", code: "+86", digits: 11 },
  pak: { label: "Pakistan", code: "+92", digits: 10 },
  ban: { label: "Bangladesh", code: "+880", digits: 10 },
  srilanka: { label: "Sri Lanka", code: "+94", digits: 9 },
  australia: { label: "Australia", code: "+61", digits: 9 },
  nepal: { label: "Nepal", code: "+977", digits: 10 },
};

/** ---------- Onboarding Schema (Wizard) ---------- */
export const employerOnboardingSchema = z
  .object({
    // step 1
    logoUrl: z.string().optional().nullable(),
    bannerUrl: z.string().optional().nullable(),
    companyName: z.string().min(2, "Company name is required"),
    about: z.string().min(10, "About is required"),

    // step 2
    organizationType: z.string().min(1, "Required"),
    industryType: z.string().min(1, "Required"),
    teamSize: z.string().min(1, "Required"),
    yearOfEstablishment: z.coerce.number().min(1800).max(new Date().getFullYear()),
    websiteUrl: z.string().optional().or(z.literal("")),
    companyVision: z.string().optional().or(z.literal("")),

    // step 3
    socialLinks: z
      .array(
        z.object({
          platform: z.string(),
          url: z.string().url("Invalid url").or(z.literal("")),
        })
      )
      .optional(),

    // step 4
    mapLocation: z.string().optional().or(z.literal("")),

    // phone UI fields
    phoneCountry: z.string().optional().or(z.literal("")),
    phoneNumber: z.string().optional().or(z.literal("")),
    phone: z.string().optional().or(z.literal("")), // final combined: +92xxxxxxxxxx

    contactEmail: z.string().email("Invalid email").or(z.literal("")).optional(),
  })
  .superRefine((data, ctx) => {
    const raw = (data.phoneNumber || "").trim();
    if (!raw) return;

    const countryKey = (data.phoneCountry || "").trim();
    const rule = PHONE_RULES[countryKey];

    if (!rule) {
      ctx.addIssue({
        code: "custom",
        path: ["phoneCountry"],
        message: "Select a country",
      });
      return;
    }

    const digitsOnly = raw.replace(/\D/g, "");
    if (digitsOnly.length !== rule.digits) {
      ctx.addIssue({
        code: "custom",
        path: ["phoneNumber"],
        message: `${rule.label} number must be exactly ${rule.digits} digits`,
      });
    }
  });

/** ---------- Default Values (Wizard) ---------- */
export const defaultEmployerValues = {
  // step 1
  logoUrl: "",
  bannerUrl: "",
  companyName: "",
  about: "",

  // step 2
  organizationType: "",
  industryType: "",
  teamSize: "",
  yearOfEstablishment: new Date().getFullYear(),
  websiteUrl: "",
  companyVision: "",

  // step 3
  socialLinks: [
    { platform: "Facebook", url: "" },
    { platform: "Twitter", url: "" },
    { platform: "Instagram", url: "" },
    { platform: "Youtube", url: "" },
    { platform: "LinkedIn", url: "" },
  ],

  // step 4
  mapLocation: "",

  phoneCountry: "pak",
  phoneNumber: "",
  phone: "",

  contactEmail: "",
};
