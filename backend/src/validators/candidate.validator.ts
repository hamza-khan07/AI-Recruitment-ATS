import { z } from "zod";

export const workExperienceSchema = z.object({
  role: z.string().min(1, { message: "Role is required" }),
  company: z.string().min(1, { message: "Company is required" }),
  startDate: z.string().nullish(),
  endDate: z.string().nullish(),
  current: z.boolean().nullish(),
  description: z.string().nullish(),
});

export const educationSchema = z.object({
  degree: z.string().min(1, { message: "Degree is required" }),
  field: z.string().nullish(),
  institution: z.string().min(1, { message: "Institution is required" }),
  startYear: z.string().nullish(),
  endYear: z.string().nullish(),
  current: z.boolean().nullish(),
});

export const candidateProfileSchema = z.object({
  name: z.string().nullish(),
  email: z.string().email().nullish(),
  title: z.string().nullish(),
  bio: z.string().nullish(),
  phone: z.string().nullish(),
  location: z.string().nullish(),
  linkedinUrl: z.union([z.string().url(), z.literal(""), z.null()]).optional(),
  portfolioUrl: z.union([z.string().url(), z.literal(""), z.null()]).optional(),
  resumeUrl: z.union([z.string().url(), z.literal(""), z.null()]).optional(),
  avatar: z.string().nullish(),
  skills: z.array(z.string()).nullish(),
  workExperience: z.array(workExperienceSchema).nullish(),
  education: z.array(educationSchema).nullish(),
});

export type CandidateProfileInput = z.infer<typeof candidateProfileSchema>;
