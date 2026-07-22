import { Router } from "express";
import { generateJobContent, analyzeApplication } from "../controllers/ai.controller.js";
import { authMiddleware } from "../middlewares/auth.middleware.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const aiRouter = Router();

// All AI routes require authentication
aiRouter.use(authMiddleware.authenticate);

// POST /api/v1/ai/generate-job-content  — HR: generate job form fields
aiRouter.post("/generate-job-content", generateJobContent);

// POST /api/v1/ai/applications/:id/analyze  — HR: (re)trigger resume AI analysis
aiRouter.post(
  "/applications/:id/analyze",
  authMiddleware.authorize(["HR", "SUPER_ADMIN"]),
  asyncHandler(analyzeApplication)
);

export { aiRouter };
