import { Router } from "express";
import { candidateController } from "../controllers/candidate.controller.js";
import { applicationController } from "../controllers/application.controller.js";
import { authMiddleware } from "../middlewares/auth.middleware.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const candidateRouter = Router();

candidateRouter.use(authMiddleware.authenticate);

candidateRouter.get("/profile", authMiddleware.authorize(["CANDIDATE"]), asyncHandler(candidateController.getProfile));
candidateRouter.post("/profile", authMiddleware.authorize(["CANDIDATE"]), asyncHandler(candidateController.upsertProfile));
candidateRouter.post("/jobs/:jobId/apply", authMiddleware.authorize(["CANDIDATE"]), asyncHandler(applicationController.apply));

export { candidateRouter };
