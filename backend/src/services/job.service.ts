import { jobRepository, type CreateJobParams, type UpdateJobParams } from "../repositories/job.repository.js";
import { companyRepository } from "../repositories/company.repository.js";
import { authRepository } from "../repositories/auth.repository.js";
import prisma from "../config/prisma.js";

const ensureCompanyAccess = async (companyId: string, currentUserId: string, currentUserRole: string) => {
  const company = await companyRepository.findCompanyById(companyId);

  if (!company) {
    throw new Error("Company not found.");
  }

  if (currentUserRole === "SUPER_ADMIN") return company;
  if (company.ownerId === currentUserId) return company;

  const user = await authRepository.findUserById(currentUserId);
  if (user && (user as any)?.companyId === companyId && user.role === "HR") return company;

  throw new Error("Unauthorized to manage jobs for this company.");
};

const resolveCompanyId = async (companyId: string | undefined, currentUserId: string, currentUserRole: string) => {
  if (companyId) return companyId;

  if (currentUserRole === "HR" || currentUserRole === "SUPER_ADMIN") {
    const user = await authRepository.findUserById(currentUserId);
    if (!user) throw new Error("User not found.");

    // Return existing companyId if already linked
    if ((user as any)?.companyId) {
      return (user as any).companyId as string;
    }

    // Auto-create a company for existing HR users who have no company yet
    if (currentUserRole === "HR") {
      const companyName: string = (user as any).name || ((user as any).email ? ((user as any).email as string).split("@")[0] : "Default Company");
      const baseSlug = companyName
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-+|-+$/g, "");
      const slug = `${baseSlug}-${Date.now()}`;

      const newCompanyId = await (prisma as any).$transaction(async (tx: any) => {
        const company = await tx.company.create({
          data: { name: companyName, slug, ownerId: currentUserId },
        });
        await tx.user.update({
          where: { id: currentUserId },
          data: { companyId: company.id },
        });
        return company.id;
      });

      return newCompanyId as string;
    }
  }

  throw new Error("Company ID is required.");
};

export const jobService = {
  async listJobs(companyId: string | undefined, currentUserId: string, currentUserRole: string, page = 1, perPage = 20, filters: any = {}) {
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

  async listPublishedJobs(page = 1, perPage = 20, filters: any = {}) {
    const skip = (page - 1) * perPage;
    return jobRepository.findPublishedJobs(skip, perPage, filters);
  },

  async getPublishedJobById(jobId: string) {
    const job = await jobRepository.getPublishedJobById(jobId);
    if (!job) throw new Error("Job not found.");
    return job;
  },

  async getJobById(jobId: string, companyId: string | undefined, currentUserId: string, currentUserRole: string) {
    const resolvedCompanyId = await resolveCompanyId(companyId, currentUserId, currentUserRole);
    await ensureCompanyAccess(resolvedCompanyId, currentUserId, currentUserRole);
    const job = await jobRepository.findJobById(jobId);

    if (!job || job.companyId !== resolvedCompanyId) throw new Error("Job not found.");
    return job;
  },

  async createJob(data: CreateJobParams, currentUserId: string, currentUserRole: string) {
    const resolvedCompanyId = await resolveCompanyId(data.companyId, currentUserId, currentUserRole);
    await ensureCompanyAccess(resolvedCompanyId, currentUserId, currentUserRole);
    return jobRepository.createJob({ ...data, companyId: resolvedCompanyId });
  },

  async updateJob(jobId: string, companyId: string | undefined, data: UpdateJobParams, currentUserId: string, currentUserRole: string) {
    const resolvedCompanyId = await resolveCompanyId(companyId, currentUserId, currentUserRole);
    await ensureCompanyAccess(resolvedCompanyId, currentUserId, currentUserRole);
    const job = await jobRepository.findJobById(jobId);
    if (!job || job.companyId !== resolvedCompanyId) throw new Error("Job not found.");
    return jobRepository.updateJob(jobId, data);
  },

  async patchJobStatus(jobId: string, companyId: string | undefined, status: string, currentUserId: string, currentUserRole: string) {
    const resolvedCompanyId = await resolveCompanyId(companyId, currentUserId, currentUserRole);
    await ensureCompanyAccess(resolvedCompanyId, currentUserId, currentUserRole);
    const job = await jobRepository.findJobById(jobId);
    if (!job || job.companyId !== resolvedCompanyId) throw new Error("Job not found.");
    return jobRepository.updateJob(jobId, { status });
  },

  async deleteJob(jobId: string, companyId: string | undefined, currentUserId: string, currentUserRole: string) {
    const resolvedCompanyId = await resolveCompanyId(companyId, currentUserId, currentUserRole);
    await ensureCompanyAccess(resolvedCompanyId, currentUserId, currentUserRole);
    const job = await jobRepository.findJobById(jobId);
    if (!job || job.companyId !== resolvedCompanyId) throw new Error("Job not found.");
    return jobRepository.deleteJob(jobId);
  },
};
