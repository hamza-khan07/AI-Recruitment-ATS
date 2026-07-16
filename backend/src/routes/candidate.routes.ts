import { Router } from "express";
import { candidateController } from "../controllers/candidate.controller.js";
import { authMiddleware } from "../middlewares/auth.middleware.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const candidateRouter = Router();

candidateRouter.use(authMiddleware.authenticate);

candidateRouter.get("/profile", authMiddleware.authorize(["CANDIDATE"]), asyncHandler(candidateController.getProfile));
candidateRouter.post("/profile", authMiddleware.authorize(["CANDIDATE"]), asyncHandler(candidateController.upsertProfile));

export { candidateRouter };
