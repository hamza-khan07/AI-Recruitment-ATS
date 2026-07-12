import { Router } from "express";
import { companyController } from "../controllers/company.controller.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { authMiddleware } from "../middlewares/auth.middleware.js";
const companyRouter = Router();
companyRouter.use(authMiddleware.authenticate);
companyRouter.get("/profile", authMiddleware.authorize(["SUPER_ADMIN", "HR"]), asyncHandler(companyController.getCompanyProfile));
companyRouter.post("/profile", authMiddleware.authorize(["SUPER_ADMIN", "HR"]), asyncHandler(companyController.upsertCompanyProfile));
companyRouter.post("/", authMiddleware.authorize(["SUPER_ADMIN"]), asyncHandler(companyController.createCompany));
companyRouter.get("/:companyId", authMiddleware.authorize(["SUPER_ADMIN", "HR"]), asyncHandler(companyController.getCompany));
companyRouter.put("/:companyId", authMiddleware.authorize(["SUPER_ADMIN", "HR"]), asyncHandler(companyController.updateCompany));
companyRouter.delete("/:companyId", authMiddleware.authorize(["SUPER_ADMIN", "HR"]), asyncHandler(companyController.deleteCompany));
companyRouter.get("/:companyId/settings", authMiddleware.authorize(["SUPER_ADMIN", "HR"]), asyncHandler(companyController.getSettings));
companyRouter.put("/:companyId/settings", authMiddleware.authorize(["SUPER_ADMIN", "HR"]), asyncHandler(companyController.updateSettings));
companyRouter.post("/:companyId/assign-hr", authMiddleware.authorize(["SUPER_ADMIN"]), asyncHandler(companyController.assignHr));
export default companyRouter;
//# sourceMappingURL=company.routes.js.map