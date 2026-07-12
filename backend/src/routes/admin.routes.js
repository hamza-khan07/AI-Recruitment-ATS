import { Router } from "express";
import { asyncHandler } from "../utils/asyncHandler.js";
import { adminController } from "../controllers/admin.controller.js";
import { authMiddleware } from "../middlewares/auth.middleware.js";
const adminRouter = Router();
adminRouter.use(authMiddleware.authenticate);
adminRouter.get("/dashboard", authMiddleware.authorize(["SUPER_ADMIN"]), asyncHandler(adminController.getDashboardStats));
export default adminRouter;
//# sourceMappingURL=admin.routes.js.map