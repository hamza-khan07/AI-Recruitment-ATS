import { z } from "zod";
export declare const createJobSchema: z.ZodObject<{
    companyId: z.ZodOptional<z.ZodString>;
    title: z.ZodString;
    department: z.ZodOptional<z.ZodString>;
    employmentType: z.ZodOptional<z.ZodString>;
    workMode: z.ZodOptional<z.ZodString>;
    location: z.ZodOptional<z.ZodString>;
    salaryMin: z.ZodOptional<z.ZodNumber>;
    salaryMax: z.ZodOptional<z.ZodNumber>;
    experience: z.ZodOptional<z.ZodString>;
    openPositions: z.ZodOptional<z.ZodNumber>;
    description: z.ZodOptional<z.ZodString>;
    responsibilities: z.ZodOptional<z.ZodString>;
    requirements: z.ZodOptional<z.ZodString>;
    qualifications: z.ZodOptional<z.ZodString>;
    skills: z.ZodOptional<z.ZodString>;
    benefits: z.ZodOptional<z.ZodString>;
    deadline: z.ZodOptional<z.ZodString>;
    status: z.ZodOptional<z.ZodString>;
}, z.core.$strip>;
export declare const updateJobSchema: z.ZodObject<{
    title: z.ZodOptional<z.ZodString>;
    department: z.ZodOptional<z.ZodString>;
    employmentType: z.ZodOptional<z.ZodString>;
    workMode: z.ZodOptional<z.ZodString>;
    location: z.ZodOptional<z.ZodString>;
    salaryMin: z.ZodUnion<[z.ZodOptional<z.ZodNumber>, z.ZodNull]>;
    salaryMax: z.ZodUnion<[z.ZodOptional<z.ZodNumber>, z.ZodNull]>;
    experience: z.ZodUnion<[z.ZodOptional<z.ZodString>, z.ZodNull]>;
    openPositions: z.ZodUnion<[z.ZodOptional<z.ZodNumber>, z.ZodNull]>;
    description: z.ZodUnion<[z.ZodOptional<z.ZodString>, z.ZodNull]>;
    responsibilities: z.ZodUnion<[z.ZodOptional<z.ZodString>, z.ZodNull]>;
    requirements: z.ZodUnion<[z.ZodOptional<z.ZodString>, z.ZodNull]>;
    qualifications: z.ZodUnion<[z.ZodOptional<z.ZodString>, z.ZodNull]>;
    skills: z.ZodUnion<[z.ZodOptional<z.ZodString>, z.ZodNull]>;
    benefits: z.ZodUnion<[z.ZodOptional<z.ZodString>, z.ZodNull]>;
    deadline: z.ZodUnion<[z.ZodOptional<z.ZodString>, z.ZodNull]>;
    status: z.ZodOptional<z.ZodString>;
}, z.core.$strip>;
export declare const jobIdParamSchema: z.ZodObject<{
    jobId: z.ZodString;
}, z.core.$strip>;
export type CreateJobInput = z.infer<typeof createJobSchema>;
export type UpdateJobInput = z.infer<typeof updateJobSchema>;
//# sourceMappingURL=job.validator.d.ts.map