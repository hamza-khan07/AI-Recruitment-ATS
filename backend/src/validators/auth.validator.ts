import { z } from "zod";

export const loginSchema = z.object({
  email: z.string().email({ message: "Email must be valid." }),
  password: z.string().min(8, { message: "Password must be at least 8 characters." }),
});

export const registerSchema = z.object({
  email: z.string().email({ message: "Email must be valid." }),
  password: z.string().min(8, { message: "Password must be at least 8 characters." }),
  name: z.string().optional(),
  role: z.enum(["SUPER_ADMIN", "HR", "CANDIDATE"]),
  companyName: z.string().min(2, { message: "Company name must be at least 2 characters." }).optional(),
});

export const refreshTokenSchema = z.object({
  refreshToken: z.string().min(1, { message: "Refresh token is required." }),
});

export const forgotPasswordSchema = z.object({
  email: z.string().email({ message: "Email must be valid." }),
});

export type LoginInput = z.infer<typeof loginSchema>;
export type RegisterInput = z.infer<typeof registerSchema>;
export type RefreshTokenInput = z.infer<typeof refreshTokenSchema>;
export type ForgotPasswordInput = z.infer<typeof forgotPasswordSchema>;
