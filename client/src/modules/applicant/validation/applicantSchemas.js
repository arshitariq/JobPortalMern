// src/modules/applicant/validation/applicantSchemas.js
import { z } from "zod";

export const applicantSettingsSchema = z.object({
  // PERSONAL
  fullName: z.string().max(200).optional().or(z.literal("")),
  headline: z.string().max(200).optional().or(z.literal("")),
  avatarUrl: z.string().optional().or(z.literal("")),
  bannerUrl: z.string().optional().or(z.literal("")),
  resumeUrl: z.string().optional().or(z.literal("")),
  experience: z.string().max(5000).optional().or(z.literal("")),
  education: z.string().max(200).optional().or(z.literal("")),
  websiteUrl: z.string().url().optional().or(z.literal("")),

  // PROFILE
  biography: z.string().max(2000).optional().or(z.literal("")),
  dateOfBirth: z.string().optional().or(z.literal("")),
  nationality: z.string().max(100).optional().or(z.literal("")),
  maritalStatus: z
    .enum(["single", "married", "divorced", "widowed"])
    .optional()
    .or(z.literal("")),
  gender: z
    .enum(["male", "female", "other"])
    .optional()
    .or(z.literal("")),
  location: z.string().max(255).optional().or(z.literal("")),
  skills: z.array(z.string().trim()).optional().default([]),

  // SOCIAL LINKS
  socialLinks: z
    .array(
      z.object({
        platform: z.string(),
        url: z.string().optional().or(z.literal("")),
      })
    )
    .optional()
    .default([]),

  // ACCOUNT
  mapLocation: z.string().max(255).optional().or(z.literal("")),
  phoneCountry: z.string().optional().or(z.literal("")),
  phoneNumber: z.string().optional().or(z.literal("")),
  phone: z.string().optional().or(z.literal("")),
  contactEmail: z.string().email().optional().or(z.literal("")),

  notifyShortlisted: z.boolean().optional().default(false),
  notifySavedProfile: z.boolean().optional().default(false),
  notifyAppliedExpired: z.boolean().optional().default(false),
  notifyRejected: z.boolean().optional().default(false),
  notifyJobAlertLimit: z.boolean().optional().default(false),

  alertRole: z.string().max(255).optional().or(z.literal("")),
  alertLocation: z.string().max(255).optional().or(z.literal("")),

  profilePublic: z.boolean().optional().default(true),
  resumePublic: z.boolean().optional().default(false),

  // PASSWORD
  currentPassword: z.string().optional().or(z.literal("")),
  newPassword: z.string().optional().or(z.literal("")),
  confirmPassword: z.string().optional().or(z.literal("")),
});

export const defaultApplicantValues = {
  fullName: "",
  headline: "",
  avatarUrl: "",
  bannerUrl: "",
  resumeUrl: "",
  experience: "",
  education: "",
  websiteUrl: "",

  biography: "",
  dateOfBirth: "",
  nationality: "",
  maritalStatus: "",
  gender: "",
  location: "",
  skills: [],

  socialLinks: [{ platform: "facebook", url: "" }],

  mapLocation: "",
  phoneCountry: "pak",
  phoneNumber: "",
  phone: "",
  contactEmail: "",

  notifyShortlisted: false,
  notifySavedProfile: false,
  notifyAppliedExpired: false,
  notifyRejected: true,
  notifyJobAlertLimit: true,

  alertRole: "",
  alertLocation: "",

  profilePublic: true,
  resumePublic: false,

  currentPassword: "",
  newPassword: "",
  confirmPassword: "",
};
