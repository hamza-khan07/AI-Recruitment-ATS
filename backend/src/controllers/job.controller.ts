import type { Request, Response, NextFunction } from "express";
import { jobService } from "../services/job.service.js";
import { createJobSchema, updateJobSchema, jobIdParamSchema } from "../validators/job.validator.js";

export const jobController = {
  async listJobs(req: Request, res: Response, next: NextFunction) {
    try {
      const companyId = req.query.companyId as string | undefined;
      const page = parseInt((req.query.page as string) ?? "1", 10);
      const perPage = parseInt((req.query.perPage as string) ?? "20", 10);
      const filters = { search: req.query.search as string | undefined, status: req.query.status as string | undefined };
      const currentUserId = (req as any).user?.id;

      if (!currentUserId) return res.status(401).json({ success: false, message: "Authentication required." });

      const result = await jobService.listJobs(companyId, currentUserId, (req as any).user.role, page, perPage, filters);
      return res.status(200).json({ success: true, data: result });
    } catch (error) {
      next(error);
    }
  },

  async listPublishedJobs(req: Request, res: Response, next: NextFunction) {
    try {
      const page = parseInt((req.query.page as string) ?? "1", 10);
      const perPage = parseInt((req.query.perPage as string) ?? "20", 10);
      const filters = { 
        search: req.query.search as string | undefined,
        location: req.query.location as string | undefined,
        type: req.query.type as string | undefined,
        experience: req.query.experience as string | undefined,
      };

      const result = await jobService.listPublishedJobs(page, perPage, filters);
      return res.status(200).json({ success: true, data: result });
    } catch (error) {
      next(error);
    }
  },

  async getPublishedJob(req: Request, res: Response, next: NextFunction) {
    try {
      const { jobId } = jobIdParamSchema.parse(req.params);
      const job = await jobService.getPublishedJobById(jobId);
      return res.status(200).json({ success: true, data: job });
    } catch (error) {
      next(error);
    }
  },

  async getJob(req: Request, res: Response, next: NextFunction) {
    try {
      const { jobId } = jobIdParamSchema.parse(req.params);
      const companyId = req.query.companyId as string | undefined;
      const currentUserId = (req as any).user?.id;

      if (!currentUserId) return res.status(401).json({ success: false, message: "Authentication required." });

      const job = await jobService.getJobById(jobId, companyId, currentUserId, (req as any).user.role);
      return res.status(200).json({ success: true, data: job });
    } catch (error) {
      next(error);
    }
  },

  async createJob(req: Request, res: Response, next: NextFunction) {
    try {
      const data = createJobSchema.parse(req.body);
      const currentUserId = (req as any).user?.id;

      if (!currentUserId) return res.status(401).json({ success: false, message: "Authentication required." });

      const job = await jobService.createJob({ ...(data as any), createdBy: currentUserId }, currentUserId, (req as any).user.role);
      return res.status(201).json({ success: true, data: job });
    } catch (error) {
      next(error);
    }
  },

  async updateJob(req: Request, res: Response, next: NextFunction) {
    try {
      const { jobId } = jobIdParamSchema.parse(req.params);
      const data = updateJobSchema.parse(req.body);
      const companyId = req.query.companyId as string | undefined;
      const currentUserId = (req as any).user?.id;

      if (!currentUserId) return res.status(401).json({ success: false, message: "Authentication required." });

      const updated = await jobService.updateJob(jobId, companyId, data as any, currentUserId, (req as any).user.role);
      return res.status(200).json({ success: true, data: updated });
    } catch (error) {
      next(error);
    }
  },

  async patchStatus(req: Request, res: Response, next: NextFunction) {
    try {
      const { jobId } = jobIdParamSchema.parse(req.params);
      const status = (req.body.status as string) ?? "DRAFT";
      const companyId = req.query.companyId as string | undefined;
      const currentUserId = (req as any).user?.id;

      if (!currentUserId) return res.status(401).json({ success: false, message: "Authentication required." });

      const updated = await jobService.patchJobStatus(jobId, companyId, status, currentUserId, (req as any).user.role);
      return res.status(200).json({ success: true, data: updated });
    } catch (error) {
      next(error);
    }
  },

  async deleteJob(req: Request, res: Response, next: NextFunction) {
    try {
      const { jobId } = jobIdParamSchema.parse(req.params);
      const companyId = req.query.companyId as string | undefined;
      const currentUserId = (req as any).user?.id;

      if (!currentUserId) return res.status(401).json({ success: false, message: "Authentication required." });

      await jobService.deleteJob(jobId, companyId, currentUserId, (req as any).user.role);
      return res.status(204).send();
    } catch (error) {
      next(error);
    }
  },
};
