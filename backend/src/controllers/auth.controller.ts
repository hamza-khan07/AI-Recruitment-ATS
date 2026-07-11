import type { Request, Response, NextFunction } from "express";
import { authService } from "../services/auth.service.js";
import { loginSchema, refreshTokenSchema, registerSchema, forgotPasswordSchema } from "../validators/auth.validator.js";

export const authController = {
  async login(req: Request, res: Response, next: NextFunction) {
    try {
      const data = loginSchema.parse(req.body);
      const tokens = await authService.login(data.email, data.password);

      return res.status(200).json({ success: true, data: { accessToken: tokens.accessToken, refreshToken: tokens.refreshToken, role: tokens.role } });
    } catch (error) {
      next(error);
    }
  },

  async register(req: Request, res: Response, next: NextFunction) {
    try {
      const data = registerSchema.parse(req.body);
      const user = await authService.register(data.email, data.password, data.name, data.role as any);

      return res.status(201).json({ success: true, data: { id: user.id, email: user.email, role: user.role } });
    } catch (error) {
      next(error);
    }
  },

  async refreshToken(req: Request, res: Response, next: NextFunction) {
    try {
      const data = refreshTokenSchema.parse(req.body);
      const tokens = await authService.refreshTokens(data.refreshToken);

      return res.status(200).json({ success: true, data: tokens });
    } catch (error) {
      next(error);
    }
  },

  async logout(req: Request, res: Response, next: NextFunction) {
    try {
      const data = refreshTokenSchema.parse(req.body);
      await authService.logout(data.refreshToken);

      return res.status(204).send();
    } catch (error) {
      next(error);
    }
  },

  async forgotPassword(req: Request, res: Response, next: NextFunction) {
    try {
      const data = forgotPasswordSchema.parse(req.body);
      await authService.forgotPassword(data.email);

      return res.status(200).json({ success: true, message: "If that email exists, a reset link will be sent." });
    } catch (error) {
      next(error);
    }
  },
};
