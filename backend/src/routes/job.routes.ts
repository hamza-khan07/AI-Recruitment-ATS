import { Router } from "express";
import { jobController } from "../controllers/job.controller.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { authMiddleware } from "../middlewares/auth.middleware.js";

const jobRouter = Router();

// Public routes for candidates
jobRouter.get("/published", asyncHandler(jobController.listPublishedJobs));
jobRouter.get("/published/:jobId", asyncHandler(jobController.getPublishedJob));

jobRouter.use(authMiddleware.authenticate);

// List jobs for a company: /jobs?companyId=...
jobRouter.get("/", authMiddleware.authorize(["SUPER_ADMIN", "HR"]), asyncHandler(jobController.listJobs));
jobRouter.post("/", authMiddleware.authorize(["SUPER_ADMIN", "HR"]), asyncHandler(jobController.createJob));
jobRouter.get("/:jobId", authMiddleware.authorize(["SUPER_ADMIN", "HR"]), asyncHandler(jobController.getJob));
jobRouter.put("/:jobId", authMiddleware.authorize(["SUPER_ADMIN", "HR"]), asyncHandler(jobController.updateJob));
jobRouter.patch("/:jobId/status", authMiddleware.authorize(["SUPER_ADMIN", "HR"]), asyncHandler(jobController.patchStatus));
jobRouter.delete("/:jobId", authMiddleware.authorize(["SUPER_ADMIN", "HR"]), asyncHandler(jobController.deleteJob));

export default jobRouter;
