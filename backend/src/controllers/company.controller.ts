import type { Request, Response, NextFunction } from "express";
import { companyService } from "../services/company.service.js";
import {
  assignHrSchema,
  companyIdParamSchema,
  companyProfileSchema,
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

      const company = await companyService.createCompany({
        name: data.name,
        slug: data.slug,
        ownerId: currentUserId,
        careerPageUrl: data.careerPageUrl,
        logoUrl: data.logoUrl,
        websiteUrl: data.websiteUrl,
        description: data.description,
      } as any, (req as any).user.role);

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

  async getCompanyProfile(req: Request, res: Response, next: NextFunction) {
    try {
      const currentUserId = (req as any).user?.id;

      if (!currentUserId) {
        return res.status(401).json({ success: false, message: "Authentication required." });
      }

      const company = await companyService.getCompanyProfile(currentUserId, (req as any).user.role);

      return res.status(200).json({ success: true, data: company });
    } catch (error) {
      next(error);
    }
  },

  async upsertCompanyProfile(req: Request, res: Response, next: NextFunction) {
    try {
      const data = companyProfileSchema.parse(req.body);
      const currentUserId = (req as any).user?.id;

      if (!currentUserId) {
        return res.status(401).json({ success: false, message: "Authentication required." });
      }

      const company = await companyService.upsertCompanyProfile({
        name: data.name,
        email: data.email,
        phone: data.phone,
        websiteUrl: data.websiteUrl ?? data.website,
        description: data.description,
        address: data.address,
        size: data.size,
        logo: data.logo,
      } as any, currentUserId, (req as any).user.role);

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

      const updated = await companyService.updateCompany(companyId, {
        name: data.name,
        slug: data.slug,
        careerPageUrl: data.careerPageUrl,
        logoUrl: data.logoUrl,
        websiteUrl: data.websiteUrl,
        description: data.description,
        size: data.size,
      } as any, currentUserId, (req as any).user.role);

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

      const settings = await companyService.updateCompanySettings(companyId, {
        locale: data.locale,
        timezone: data.timezone,
        billingEmail: data.billingEmail,
        timezoneOffset: data.timezoneOffset,
        metadata: data.metadata,
      } as any, currentUserId, (req as any).user.role);

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
