import bcrypt from "bcrypt";
import { authRepository, type AppRole, type CreateUserParams } from "../repositories/auth.repository.js";
import { companyRepository } from "../repositories/company.repository.js";
import { jwtUtils } from "../utils/jwt.js";
import { env } from "../config/env.js";
import prisma from "../config/prisma.js";

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

export const authService = {
  async login(email: string, password: string) {
    const user = await authRepository.findUserByEmail(email);

    if (!user || !user.isActive) {
      throw new Error("Invalid credentials.");
    }

    const isMatch = await bcrypt.compare(password, user.passwordHash);

    if (!isMatch) {
      throw new Error("Invalid credentials.");
    }

    const payload = { sub: user.id, role: user.role, email: user.email };
    const accessToken = jwtUtils.signAccessToken(payload);
    const refreshToken = jwtUtils.signRefreshToken(payload);
    const refreshTokenExpiresAt = new Date(Date.now() + this.parseExpiration(env.refreshTokenExpiresIn));

    await authRepository.saveRefreshToken({
      token: refreshToken,
      userId: user.id,
      expiresAt: refreshTokenExpiresAt,
    });

    return { accessToken, refreshToken, role: user.role };
  },

  async logout(refreshToken: string) {
    await authRepository.revokeRefreshToken(refreshToken);
  },

  async refreshTokens(refreshToken: string) {
    const tokenRecord = await authRepository.findRefreshToken(refreshToken);

    if (!tokenRecord || tokenRecord.expiresAt < new Date()) {
      throw new Error("Refresh token is invalid or expired.");
    }

    const payload = jwtUtils.verifyRefreshToken(refreshToken);
    const user = await authRepository.findUserById(payload.sub);

    if (!user || !user.isActive) {
      throw new Error("Refresh token is invalid.");
    }

    const newPayload = { sub: user.id, role: user.role, email: user.email };
    const accessToken = jwtUtils.signAccessToken(newPayload);
    const newRefreshToken = jwtUtils.signRefreshToken(newPayload);
    const refreshTokenExpiresAt = new Date(Date.now() + this.parseExpiration(env.refreshTokenExpiresIn));

    await authRepository.revokeRefreshToken(refreshToken);
    await authRepository.saveRefreshToken({
      token: newRefreshToken,
      userId: user.id,
      expiresAt: refreshTokenExpiresAt,
    });

    return { accessToken, refreshToken: newRefreshToken };
  },

  async register(email: string, password: string, name: string | undefined, role: AppRole, companyName?: string) {
    const existingUser = await authRepository.findUserByEmail(email);

    if (existingUser) {
      throw new Error("A user with that email already exists.");
    }

    const passwordHash = await bcrypt.hash(password, env.bcryptSaltRounds);

    if (role === "HR") {
      if (!companyName) {
        throw new Error("Company name is required when registering as HR.");
      }

      // Generate a URL-safe slug from the company name
      const baseSlug = companyName
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-+|-+$/g, "");
      const slug = `${baseSlug}-${Date.now()}`;

      // Use a transaction to ensure atomicity
      const user = await (prisma as any).$transaction(async (tx: any) => {
        // 1. Create the user first (no companyId yet)
        const newUser = await tx.user.create({
          data: {
            email,
            passwordHash,
            name,
            role,
          },
        });

        // 2. Create the company with the HR user as owner
        const company = await tx.company.create({
          data: {
            name: companyName,
            slug,
            ownerId: newUser.id,
          },
        });

        // 3. Link the companyId back to the HR user
        const updatedUser = await tx.user.update({
          where: { id: newUser.id },
          data: { companyId: company.id },
        });

        return updatedUser;
      });

      return user;
    }

    // For non-HR roles, create user normally
    const user = await authRepository.createUser({
      email,
      passwordHash,
      name,
      role,
    } as CreateUserParams);

    return user;
  },

  async forgotPassword(email: string) {
    const user = await authRepository.findUserByEmail(email);

    if (!user) {
      return;
    }

    // Placeholder: issue reset token and send email in future.
    return { userId: user.id, email: user.email };
  },

  parseExpiration(value: string) {
    const multiplier = value.endsWith("d") ? 86400000 : value.endsWith("h") ? 3600000 : value.endsWith("m") ? 60000 : 1000;
    const amount = Number(value.slice(0, -1));
    return Number.isNaN(amount) ? 0 : amount * multiplier;
  },
};
