import { Router } from "express";
import { applicationController } from "../controllers/application.controller.js";
import { authMiddleware } from "../middlewares/auth.middleware.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const applicationRouter = Router();

applicationRouter.use(authMiddleware.authenticate);

// HR routes
applicationRouter.get(
  "/",
  authMiddleware.authorize(["HR", "SUPER_ADMIN"]),
  asyncHandler(applicationController.listForCompany)
);
applicationRouter.get(
  "/:id",
  authMiddleware.authorize(["HR", "SUPER_ADMIN"]),
  asyncHandler(applicationController.getDetail)
);
applicationRouter.patch(
  "/:id/status",
  authMiddleware.authorize(["HR", "SUPER_ADMIN"]),
  asyncHandler(applicationController.updateStatus)
);
applicationRouter.patch(
  "/:id/details",
  authMiddleware.authorize(["HR", "SUPER_ADMIN"]),
  asyncHandler(applicationController.updateDetails)
);
applicationRouter.delete(
  "/:id",
  authMiddleware.authorize(["HR", "SUPER_ADMIN"]),
  asyncHandler(applicationController.deleteApplication)
);

export { applicationRouter };
