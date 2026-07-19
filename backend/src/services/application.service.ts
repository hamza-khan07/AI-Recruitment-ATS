import { applicationRepository } from "../repositories/application.repository.js";

export const applicationService = {
  async applyForJob(
    jobId: string,
    candidateId: string,
    data: {
      fullName: string;
      email: string;
      phone?: string | null;
      resumeUrl?: string | null;
      coverLetter?: string | null;
    }
  ) {
    // Prevent duplicate applications
    const existing = await applicationRepository.findByJobIdAndCandidateId(jobId, candidateId);
    if (existing) {
      throw Object.assign(new Error("You have already applied for this job."), { statusCode: 409 });
    }

    return applicationRepository.create({ jobId, candidateId, ...data });
  },

  async getCandidateApplications(candidateId: string) {
    return applicationRepository.findByCandidateId(candidateId);
  },

  async getCompanyApplications(
    companyId: string,
    filters: { status?: string; jobId?: string; search?: string },
    page: number,
    perPage: number
  ) {
    return applicationRepository.findByCompanyId(companyId, filters, page, perPage);
  },

  async getApplicationById(id: string, companyId: string) {
    const application = await applicationRepository.findById(id);
    if (!application) {
      throw Object.assign(new Error("Application not found."), { statusCode: 404 });
    }
    // Verify the application belongs to this company
    if ((application as any).job?.company?.id !== companyId) {
      throw Object.assign(new Error("Access denied."), { statusCode: 403 });
    }
    return application;
  },

  async updateStatus(id: string, status: string, companyId: string) {
    const application = await applicationRepository.findById(id);
    if (!application) {
      throw Object.assign(new Error("Application not found."), { statusCode: 404 });
    }
    if ((application as any).job?.company?.id !== companyId) {
      throw Object.assign(new Error("Access denied."), { statusCode: 403 });
    }
    return applicationRepository.updateStatus(id, status);
  },

  async updateDetails(
    id: string,
    data: { rating?: number; notes?: string; interviewDate?: Date | null; interviewEndTime?: Date | null },
    companyId: string
  ) {
    const application = await applicationRepository.findById(id);
    if (!application) {
      throw Object.assign(new Error("Application not found."), { statusCode: 404 });
    }
    if ((application as any).job?.company?.id !== companyId) {
      throw Object.assign(new Error("Access denied."), { statusCode: 403 });
    }

    const updated = await applicationRepository.updateDetails(id, data);
    return updated;
  },
};
