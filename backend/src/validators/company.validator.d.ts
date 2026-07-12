import { z } from "zod";
export declare const createCompanySchema: z.ZodObject<{
    name: z.ZodString;
    slug: z.ZodString;
    careerPageUrl: z.ZodOptional<z.ZodString>;
    logoUrl: z.ZodOptional<z.ZodString>;
    websiteUrl: z.ZodOptional<z.ZodString>;
    description: z.ZodOptional<z.ZodString>;
}, z.core.$strip>;
export declare const updateCompanySchema: z.ZodObject<{
    name: z.ZodOptional<z.ZodString>;
    slug: z.ZodOptional<z.ZodString>;
    careerPageUrl: z.ZodOptional<z.ZodString>;
    logoUrl: z.ZodOptional<z.ZodString>;
    websiteUrl: z.ZodOptional<z.ZodString>;
    description: z.ZodOptional<z.ZodString>;
}, z.core.$strip>;
export declare const companySettingsSchema: z.ZodObject<{
    locale: z.ZodOptional<z.ZodString>;
    timezone: z.ZodOptional<z.ZodString>;
    billingEmail: z.ZodOptional<z.ZodString>;
    timezoneOffset: z.ZodOptional<z.ZodNumber>;
    metadata: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodUnknown>>;
}, z.core.$strip>;
export declare const companyIdParamSchema: z.ZodObject<{
    companyId: z.ZodString;
}, z.core.$strip>;
export declare const companyProfileSchema: z.ZodObject<{
    name: z.ZodOptional<z.ZodString>;
    email: z.ZodUnion<[z.ZodOptional<z.ZodString>, z.ZodLiteral<"">]>;
    phone: z.ZodOptional<z.ZodString>;
    website: z.ZodOptional<z.ZodString>;
    websiteUrl: z.ZodOptional<z.ZodString>;
    description: z.ZodOptional<z.ZodString>;
    address: z.ZodOptional<z.ZodString>;
    logo: z.ZodOptional<z.ZodString>;
}, z.core.$strip>;
export declare const assignHrSchema: z.ZodObject<{
    userId: z.ZodString;
}, z.core.$strip>;
export type CreateCompanyInput = z.infer<typeof createCompanySchema>;
export type UpdateCompanyInput = z.infer<typeof updateCompanySchema>;
export type CompanySettingsInput = z.infer<typeof companySettingsSchema>;
export type CompanyIdParam = z.infer<typeof companyIdParamSchema>;
export type CompanyProfileInput = z.infer<typeof companyProfileSchema>;
export type AssignHrInput = z.infer<typeof assignHrSchema>;
//# sourceMappingURL=company.validator.d.ts.map