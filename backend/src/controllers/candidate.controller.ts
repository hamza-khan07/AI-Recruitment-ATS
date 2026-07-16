import type { Request, Response, NextFunction } from "express";
import { candidateService } from "../services/candidate.service.js";
import { candidateProfileSchema } from "../validators/candidate.validator.js";

export const candidateController = {
  async getProfile(req: Request, res: Response, next: NextFunction) {
    try {
      const currentUserId = (req as any).user?.id;

      if (!currentUserId) {
        return res.status(401).json({ success: false, message: "Authentication required." });
      }

      const profile = await candidateService.getProfile(currentUserId);

      // We can return 200 even if profile is null, frontend will handle the empty state
      return res.status(200).json({ success: true, data: profile });
    } catch (error) {
      next(error);
    }
  },

  async upsertProfile(req: Request, res: Response, next: NextFunction) {
    try {
      const currentUserId = (req as any).user?.id;

      if (!currentUserId) {
        return res.status(401).json({ success: false, message: "Authentication required." });
      }

      const data = candidateProfileSchema.parse(req.body);
      const profile = await candidateService.upsertProfile(currentUserId, data);

      return res.status(200).json({ success: true, data: profile });
    } catch (error) {
      next(error);
    }
  },
};
