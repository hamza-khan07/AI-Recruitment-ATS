import { Router } from "express";
import { authController } from "../controllers/auth.controller.js";
import { asyncHandler } from "../utils/asyncHandler.js";
const authRouter = Router();
authRouter.post("/login", asyncHandler(authController.login));
authRouter.post("/register", asyncHandler(authController.register));
authRouter.post("/refresh", asyncHandler(authController.refreshToken));
authRouter.post("/logout", asyncHandler(authController.logout));
authRouter.post("/forgot-password", asyncHandler(authController.forgotPassword));
export default authRouter;
//# sourceMappingURL=auth.routes.js.map