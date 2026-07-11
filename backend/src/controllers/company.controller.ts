import type { Request, Response, NextFunction } from "express";
import { companyService } from "../services/company.service.js";
import {
  assignHrSchema,
  companyIdParamSchema,
  companySettingsSchema,
  createCompanySchema,
  updateCompanySchema,
} from "../validators/company.validator.js";

export const companyController = {
  async createCompany(req: Request, res: Response, next: NextFunction) {
    try {
      const data = createCompanySchema.parse(req.body);
      const currentUserId = (req as any).user?.id;

      if (!currentUserId) {
        return res.status(401).json({ success: false, message: "Authentication required." });
      }

      const company = await companyService.createCompany({ ...data, ownerId: currentUserId }, (req as any).user.role);

      return res.status(201).json({ success: true, data: company });
    } catch (error) {
      next(error);
    }
  },

  async getCompany(req: Request, res: Response, next: NextFunction) {
    try {
      const { companyId } = companyIdParamSchema.parse(req.params);
      const currentUserId = (req as any).user?.id;

      if (!currentUserId) {
        return res.status(401).json({ success: false, message: "Authentication required." });
      }

      const company = await companyService.getCompanyById(companyId, currentUserId, (req as any).user.role);

      return res.status(200).json({ success: true, data: company });
    } catch (error) {
      next(error);
    }
  },

  async updateCompany(req: Request, res: Response, next: NextFunction) {
    try {
      const { companyId } = companyIdParamSchema.parse(req.params);
      const data = updateCompanySchema.parse(req.body);
      const currentUserId = (req as any).user?.id;

      if (!currentUserId) {
        return res.status(401).json({ success: false, message: "Authentication required." });
      }

      const updated = await companyService.updateCompany(companyId, data, currentUserId, (req as any).user.role);

      return res.status(200).json({ success: true, data: updated });
    } catch (error) {
      next(error);
    }
  },

  async deleteCompany(req: Request, res: Response, next: NextFunction) {
    try {
      const { companyId } = companyIdParamSchema.parse(req.params);
      const currentUserId = (req as any).user?.id;

      if (!currentUserId) {
        return res.status(401).json({ success: false, message: "Authentication required." });
      }

      await companyService.deleteCompany(companyId, currentUserId, (req as any).user.role);

      return res.status(204).send();
    } catch (error) {
      next(error);
    }
  },

  async getSettings(req: Request, res: Response, next: NextFunction) {
    try {
      const { companyId } = companyIdParamSchema.parse(req.params);
      const currentUserId = (req as any).user?.id;

      if (!currentUserId) {
        return res.status(401).json({ success: false, message: "Authentication required." });
      }

      const settings = await companyService.getCompanySettings(companyId, currentUserId, (req as any).user.role);

      return res.status(200).json({ success: true, data: settings });
    } catch (error) {
      next(error);
    }
  },

  async updateSettings(req: Request, res: Response, next: NextFunction) {
    try {
      const { companyId } = companyIdParamSchema.parse(req.params);
      const data = companySettingsSchema.parse(req.body);
      const currentUserId = (req as any).user?.id;

      if (!currentUserId) {
        return res.status(401).json({ success: false, message: "Authentication required." });
      }

      const settings = await companyService.updateCompanySettings(companyId, data, currentUserId, (req as any).user.role);

      return res.status(200).json({ success: true, data: settings });
    } catch (error) {
      next(error);
    }
  },

  async assignHr(req: Request, res: Response, next: NextFunction) {
    try {
      const { companyId } = companyIdParamSchema.parse(req.params);
      const data = assignHrSchema.parse(req.body);
      const currentUserId = (req as any).user?.id;

      if (!currentUserId) {
        return res.status(401).json({ success: false, message: "Authentication required." });
      }

      const user = await companyService.assignHrToCompany(data.userId, companyId, currentUserId, (req as any).user.role);

      return res.status(200).json({ success: true, data: user });
    } catch (error) {
      next(error);
    }
  },
};
