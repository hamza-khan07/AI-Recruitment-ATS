import { adminService } from "../services/admin.service.js";
export const adminController = {
    async getDashboardStats(req, res, next) {
        try {
            const stats = await adminService.getDashboardStats();
            return res.status(200).json({ success: true, data: stats });
        }
        catch (error) {
            next(error);
        }
    },
};
//# sourceMappingURL=admin.controller.js.map