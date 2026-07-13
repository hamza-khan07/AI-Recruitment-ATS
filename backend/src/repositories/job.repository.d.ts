export interface CreateJobParams {
    companyId?: string;
    title: string;
    department?: string;
    employmentType?: string;
    workMode?: string;
    location?: string;
    salaryMin?: number;
    salaryMax?: number;
    experience?: string;
    openPositions?: number;
    applications?: number;
    skills?: string;
    qualifications?: string;
    description?: string;
    responsibilities?: string;
    requirements?: string;
    benefits?: string;
    deadline?: Date;
    status?: string;
    createdBy: string;
}
export interface UpdateJobParams {
    title?: string;
    department?: string;
    employmentType?: string;
    workMode?: string;
    location?: string;
    salaryMin?: number | null;
    salaryMax?: number | null;
    experience?: string;
    openPositions?: number | null;
    description?: string | null;
    responsibilities?: string | null;
    requirements?: string | null;
    qualifications?: string | null;
    skills?: string | null;
    benefits?: string | null;
    deadline?: Date | null;
    status?: string;
}
export declare const jobRepository: {
    createJob(data: CreateJobParams): Promise<any>;
    findJobById(id: string): Promise<any>;
    findJobsForCompany(companyId: string, skip?: number, take?: number, filters?: any): Promise<any>;
    countJobsForCompany(companyId: string, filters?: any): Promise<any>;
    updateJob(id: string, data: UpdateJobParams): Promise<any>;
    countJobsByStatus(companyId: string, status: string): Promise<any>;
    sumOpenPositions(companyId: string): Promise<any>;
    deleteJob(id: string): Promise<any>;
};
//# sourceMappingURL=job.repository.d.ts.map