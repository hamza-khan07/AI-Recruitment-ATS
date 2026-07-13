import { type CreateJobParams, type UpdateJobParams } from "../repositories/job.repository.js";
export declare const jobService: {
    listJobs(companyId: string | undefined, currentUserId: string, currentUserRole: string, page?: number, perPage?: number, filters?: any): Promise<{
        jobs: any;
        total: any;
        active: any;
        inactive: any;
        openings: any;
    }>;
    getJobById(jobId: string, companyId: string | undefined, currentUserId: string, currentUserRole: string): Promise<any>;
    createJob(data: CreateJobParams, currentUserId: string, currentUserRole: string): Promise<any>;
    updateJob(jobId: string, companyId: string | undefined, data: UpdateJobParams, currentUserId: string, currentUserRole: string): Promise<any>;
    patchJobStatus(jobId: string, companyId: string | undefined, status: string, currentUserId: string, currentUserRole: string): Promise<any>;
    deleteJob(jobId: string, companyId: string | undefined, currentUserId: string, currentUserRole: string): Promise<any>;
};
//# sourceMappingURL=job.service.d.ts.map