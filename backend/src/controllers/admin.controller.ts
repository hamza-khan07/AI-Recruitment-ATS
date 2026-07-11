import type { Request, Response, NextFunction } from "express";
import { adminService } from "../services/admin.service.js";

export const adminController = {
  async getDashboardStats(req: Request, res: Response, next: NextFunction) {
    try {
      const stats = await adminService.getDashboardStats();
      return res.status(200).json({ success: true, data: stats });
    } catch (error) {
      next(error);
    }
  },
};
