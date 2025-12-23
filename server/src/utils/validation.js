const { z } = require("zod");

/**
 * Register Schema
 */
const registerUserSchema = z
  .object({
    name: z
      .string()
      .trim()
      .min(2, "Name must be at least 2 characters long")
      .max(255, "Name must not exceed 255 characters"),

    userName: z
      .string()
      .trim()
      .min(3, "Username must be at least 3 characters long")
      .max(255, "Username must not exceed 255 characters")
      .regex(
        /^[a-zA-Z0-9_-]+$/,
        "Username can only contain letters, numbers, underscores, and hyphens"
      )
      .toLowerCase(),

    email: z
      .string()
      .email("Please enter a valid email address")
      .trim()
      .max(255, "Email must not exceed 255 characters")
      .toLowerCase(),

    password: z
      .string()
      .min(6, "Password must be at least 6 characters long"),

    confirmPassword: z.string(),

    role: z
      .enum(["applicant", "employer"], {
        errorMap: () => ({ message: "Role must be applicant or employer" }),
      })
      .default("applicant"),

    phoneNumber: z
      .string()
      .optional()
      .refine(
        (val) => !val || /^\+?[\d\s-()]+$/.test(val),
        "Please enter a valid phone number"
      ),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
  });

/**
 * Login Schema
 */
const loginUserSchema = z.object({
  email: z
    .string()
    .email("Please enter a valid email address")
    .trim()
    .max(255, "Email must not exceed 255 characters")
    .toLowerCase(),

  password: z.string().min(6, "Password must be at least 6 characters long"),
});

/**
 * Forgot Password Schema
 */
const forgotPasswordSchema = z.object({
  email: z.string().email("Please enter a valid email").trim().toLowerCase(),
});

/**
 * Reset Password Schema
 */
const resetPasswordSchema = z
  .object({
    token: z.string().min(10, "Invalid token"),
    password: z.string().min(8, "Password must be at least 8 characters long"),
    confirmPassword: z.string(),
  })
  .refine((d) => d.password === d.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
  });

/**
 * Resend Verification Schema
 */
const resendVerificationSchema = z.object({
  email: z.string().email("Please enter a valid email").trim().toLowerCase(),
});

/**
 * Employer Profile Schema
 */
const employerOrganizationTypes = [
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

const employerTeamSizes = [
  "1-10",
  "11-50",
  "51-200",
  "201-500",
  "501-1000",
  "1000+",
];

const employerProfileSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, "Company name must be at least 2 characters long")
    .max(255, "Company name must not exceed 255 characters"),
  description: z
    .string()
    .trim()
    .min(10, "Description must be at least 10 characters long")
    .max(5000, "Description must not exceed 5000 characters"),
  organizationType: z.enum(employerOrganizationTypes, {
    errorMap: () => ({ message: "Invalid organization type" }),
  }),
  teamSize: z.enum(employerTeamSizes, {
    errorMap: () => ({ message: "Invalid team size" }),
  }),
  yearOfEstablishment: z
    .string()
    .regex(/^\d{4}$/, "Enter a valid year")
    .refine((value) => {
      const year = Number(value);
      const currentYear = new Date().getFullYear();
      return year >= 1800 && year <= currentYear;
    }, "Year must be between 1800 and the current year"),
  websiteUrl: z
    .string()
    .trim()
    .url("Please enter a valid URL")
    .optional()
    .or(z.literal("")),
  location: z
    .string()
    .trim()
    .min(2, "Location must be at least 2 characters long")
    .max(255, "Location must not exceed 255 characters")
    .optional()
    .or(z.literal("")),
});

module.exports = {
  registerUserSchema,
  loginUserSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
  resendVerificationSchema,
  employerProfileSchema,
};
