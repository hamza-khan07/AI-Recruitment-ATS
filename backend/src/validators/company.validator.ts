import { z } from "zod";

export const createCompanySchema = z.object({
  name: z.string().min(2, { message: "Company name is required." }),
  slug: z.string().min(2, { message: "Company slug is required." }).regex(/^[a-z0-9-]+$/, { message: "Slug must use lowercase letters, numbers and hyphens only." }),
  careerPageUrl: z.string().url({ message: "Career page URL must be valid." }).optional(),
  logoUrl: z.string().url({ message: "Logo URL must be valid." }).optional(),
  websiteUrl: z.string().url({ message: "Website URL must be valid." }).optional(),
  description: z.string().max(1000).optional(),
});

export const updateCompanySchema = z.object({
  name: z.string().min(2).optional(),
  slug: z.string().min(2).regex(/^[a-z0-9-]+$/).optional(),
  careerPageUrl: z.string().url().optional(),
  logoUrl: z.string().url().optional(),
  websiteUrl: z.string().url().optional(),
  description: z.string().max(1000).optional(),
});

export const companySettingsSchema = z.object({
  locale: z.string().optional(),
  timezone: z.string().optional(),
  billingEmail: z.string().email().optional(),
  timezoneOffset: z.number().optional(),
  metadata: z.record(z.string(), z.unknown()).optional(),
});

export const companyIdParamSchema = z.object({
  companyId: z.string().uuid({ message: "Company ID must be a valid UUID." }),
});

export const companyProfileSchema = z.object({
  name: z.string().min(2, { message: "Company name is required." }).optional(),
  email: z.string().email().optional().or(z.literal("")),
  phone: z.string().optional(),
  website: z.string().optional(),
  websiteUrl: z.string().optional(),
  description: z.string().optional(),
  address: z.string().optional(),
  logo: z.string().optional(),
});

export const assignHrSchema = z.object({
  userId: z.string().uuid({ message: "User ID must be a valid UUID." }),
});

export type CreateCompanyInput = z.infer<typeof createCompanySchema>;
export type UpdateCompanyInput = z.infer<typeof updateCompanySchema>;
export type CompanySettingsInput = z.infer<typeof companySettingsSchema>;
export type CompanyIdParam = z.infer<typeof companyIdParamSchema>;
export type CompanyProfileInput = z.infer<typeof companyProfileSchema>;
export type AssignHrInput = z.infer<typeof assignHrSchema>;
