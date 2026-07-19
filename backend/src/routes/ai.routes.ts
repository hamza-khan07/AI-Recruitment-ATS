import { Router } from "express";
import { generateJobContent } from "../controllers/ai.controller.js";
import { authMiddleware } from "../middlewares/auth.middleware.js";

const aiRouter = Router();

// All AI routes require authentication (only logged-in HR can use AI features)
aiRouter.use(authMiddleware.authenticate);

// POST /api/v1/ai/generate-job-content
// Body: { field: "description" | "responsibilities" | ..., context: { title, department, ... } }
// Returns: { success: true, data: { text: "Generated text...", field: "description" } }
aiRouter.post("/generate-job-content", generateJobContent);

export { aiRouter };
