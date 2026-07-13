import { jobRepository } from "../repositories/job.repository.js";
import { companyRepository } from "../repositories/company.repository.js";
import { authRepository } from "../repositories/auth.repository.js";
const ensureCompanyAccess = async (companyId, currentUserId, currentUserRole) => {
    const company = await companyRepository.findCompanyById(companyId);
    if (!company) {
        throw new Error("Company not found.");
    }
    if (currentUserRole === "SUPER_ADMIN")
        return company;
    if (company.ownerId === currentUserId)
        return company;
    const user = await authRepository.findUserById(currentUserId);
    if (user && user?.companyId === companyId && user.role === "HR")
        return company;
    throw new Error("Unauthorized to manage jobs for this company.");
};
const resolveCompanyId = async (companyId, currentUserId, currentUserRole) => {
    if (companyId)
        return companyId;
    if (currentUserRole === "HR") {
        const user = await authRepository.findUserById(currentUserId);
        if (user && user?.companyId) {
            return user.companyId;
        }
    }
    throw new Error("Company ID is required.");
};
export const jobService = {
    async listJobs(companyId, currentUserId, currentUserRole, page = 1, perPage = 20, filters = {}) {
        const resolvedCompanyId = await resolveCompanyId(companyId, currentUserId, currentUserRole);
        await ensureCompanyAccess(resolvedCompanyId, currentUserId, currentUserRole);
        const skip = (page - 1) * perPage;
        const jobs = await jobRepository.findJobsForCompany(resolvedCompanyId, skip, perPage, filters);
        const total = await jobRepository.countJobsForCompany(resolvedCompanyId, filters);
        const active = await jobRepository.countJobsByStatus(resolvedCompanyId, "PUBLISHED");
        const inactive = await jobRepository.countJobsByStatus(resolvedCompanyId, "DRAFT");
        const openings = await jobRepository.sumOpenPositions(resolvedCompanyId);
        return { jobs, total, active, inactive, openings };
    },
    async getJobById(jobId, companyId, currentUserId, currentUserRole) {
        const resolvedCompanyId = await resolveCompanyId(companyId, currentUserId, currentUserRole);
        await ensureCompanyAccess(resolvedCompanyId, currentUserId, currentUserRole);
        const job = await jobRepository.findJobById(jobId);
        if (!job || job.companyId !== resolvedCompanyId)
            throw new Error("Job not found.");
        return job;
    },
    async createJob(data, currentUserId, currentUserRole) {
        const resolvedCompanyId = await resolveCompanyId(data.companyId, currentUserId, currentUserRole);
        await ensureCompanyAccess(resolvedCompanyId, currentUserId, currentUserRole);
        return jobRepository.createJob({ ...data, companyId: resolvedCompanyId });
    },
    async updateJob(jobId, companyId, data, currentUserId, currentUserRole) {
        const resolvedCompanyId = await resolveCompanyId(companyId, currentUserId, currentUserRole);
        await ensureCompanyAccess(resolvedCompanyId, currentUserId, currentUserRole);
        const job = await jobRepository.findJobById(jobId);
        if (!job || job.companyId !== resolvedCompanyId)
            throw new Error("Job not found.");
        return jobRepository.updateJob(jobId, data);
    },
    async patchJobStatus(jobId, companyId, status, currentUserId, currentUserRole) {
        const resolvedCompanyId = await resolveCompanyId(companyId, currentUserId, currentUserRole);
        await ensureCompanyAccess(resolvedCompanyId, currentUserId, currentUserRole);
        const job = await jobRepository.findJobById(jobId);
        if (!job || job.companyId !== resolvedCompanyId)
            throw new Error("Job not found.");
        return jobRepository.updateJob(jobId, { status });
    },
    async deleteJob(jobId, companyId, currentUserId, currentUserRole) {
        const resolvedCompanyId = await resolveCompanyId(companyId, currentUserId, currentUserRole);
        await ensureCompanyAccess(resolvedCompanyId, currentUserId, currentUserRole);
        const job = await jobRepository.findJobById(jobId);
        if (!job || job.companyId !== resolvedCompanyId)
            throw new Error("Job not found.");
        return jobRepository.deleteJob(jobId);
    },
};
//# sourceMappingURL=job.service.js.map