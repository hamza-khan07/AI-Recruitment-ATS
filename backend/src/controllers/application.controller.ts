import type { Request, Response, NextFunction } from "express";
import { applicationService } from "../services/application.service.js";
import { authRepository } from "../repositories/auth.repository.js";
import { z } from "zod";

const applySchema = z.object({
  fullName: z.string().min(1),
  email: z.string().email(),
  phone: z.string().nullish(),
  resumeUrl: z.string().nullish(),
  coverLetter: z.string().nullish(),
});

const VALID_STATUSES = ["APPLIED", "IN_REVIEW", "SHORTLISTED", "INTERVIEW", "REJECTED", "HIRED"];

export const applicationController = {
  /** POST /candidates/jobs/:jobId/apply */
  async apply(req: Request, res: Response, next: NextFunction) {
    try {
      const candidateId = (req as any).user?.id;
      if (!candidateId) return res.status(401).json({ success: false, message: "Authentication required." });

      const jobId = req.params.jobId as string;
      const data = applySchema.parse(req.body);

      const application = await applicationService.applyForJob(jobId, candidateId, {
        fullName: data.fullName,
        email: data.email,
        phone: data.phone ?? null,
        resumeUrl: data.resumeUrl ?? null,
        coverLetter: data.coverLetter ?? null,
      });
      return res.status(201).json({ success: true, data: application });
    } catch (error: any) {
      if (error.statusCode === 409) return res.status(409).json({ success: false, message: error.message });
      next(error);
    }
  },

  /** GET /applications — HR: list all applications for their company */
  async listForCompany(req: Request, res: Response, next: NextFunction) {
    try {
      const currentUserId = (req as any).user?.id;
      const user = await authRepository.findUserById(currentUserId);
      const companyId = (user as any)?.companyId;
      if (!companyId) return res.status(403).json({ success: false, message: "No company associated with your account." });

      const page = parseInt((req.query.page as string) ?? "1", 10);
      const perPage = parseInt((req.query.perPage as string) ?? "20", 10);

      // Build filters — only pass defined values to satisfy exactOptionalPropertyTypes
      const filters: { status?: string; jobId?: string; search?: string } = {};
      if (req.query.status)  filters.status  = req.query.status  as string;
      if (req.query.jobId)   filters.jobId   = req.query.jobId   as string;
      if (req.query.search)  filters.search  = req.query.search  as string;

      const result = await applicationService.getCompanyApplications(companyId, filters, page, perPage);
      return res.status(200).json({ success: true, data: result });
    } catch (error) {
      next(error);
    }
  },

  /** GET /applications/:id — HR: get full detail of one application */
  async getDetail(req: Request, res: Response, next: NextFunction) {
    try {
      const currentUserId = (req as any).user?.id;
      const user = await authRepository.findUserById(currentUserId);
      const companyId = (user as any)?.companyId;
      if (!companyId) return res.status(403).json({ success: false, message: "No company associated with your account." });

      const id = req.params.id as string;
      const application = await applicationService.getApplicationById(id, companyId);
      return res.status(200).json({ success: true, data: application });
    } catch (error: any) {
      if (error.statusCode === 404) return res.status(404).json({ success: false, message: error.message });
      if (error.statusCode === 403) return res.status(403).json({ success: false, message: error.message });
      next(error);
    }
  },

  /** PATCH /applications/:id/status — HR: update status */
  async updateStatus(req: Request, res: Response, next: NextFunction) {
    try {
      const currentUserId = (req as any).user?.id;
      const user = await authRepository.findUserById(currentUserId);
      const companyId = (user as any)?.companyId;
      if (!companyId) return res.status(403).json({ success: false, message: "No company associated with your account." });

      const id = req.params.id as string;
      const { status } = req.body;
      if (!status || !VALID_STATUSES.includes(status)) {
        return res.status(400).json({ success: false, message: `status must be one of: ${VALID_STATUSES.join(", ")}` });
      }

      const updated = await applicationService.updateStatus(id, status, companyId);
      return res.status(200).json({ success: true, data: updated });
    } catch (error: any) {
      if (error.statusCode === 404) return res.status(404).json({ success: false, message: error.message });
      if (error.statusCode === 403) return res.status(403).json({ success: false, message: error.message });
      next(error);
    }
  },
};
