import bcrypt from "bcrypt";
import { authRepository } from "../repositories/auth.repository.js";
import { jwtUtils } from "../utils/jwt.js";
import { env } from "../config/env.js";
export const authService = {
    async login(email, password) {
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
    async logout(refreshToken) {
        await authRepository.revokeRefreshToken(refreshToken);
    },
    async refreshTokens(refreshToken) {
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
    async register(email, password, name, role) {
        const existingUser = await authRepository.findUserByEmail(email);
        if (existingUser) {
            throw new Error("A user with that email already exists.");
        }
        const passwordHash = await bcrypt.hash(password, env.bcryptSaltRounds);
        const user = await authRepository.createUser({
            email,
            passwordHash,
            name,
            role,
        });
        return user;
    },
    async forgotPassword(email) {
        const user = await authRepository.findUserByEmail(email);
        if (!user) {
            return;
        }
        // Placeholder: issue reset token and send email in future.
        return { userId: user.id, email: user.email };
    },
    parseExpiration(value) {
        const multiplier = value.endsWith("d") ? 86400000 : value.endsWith("h") ? 3600000 : value.endsWith("m") ? 60000 : 1000;
        const amount = Number(value.slice(0, -1));
        return Number.isNaN(amount) ? 0 : amount * multiplier;
    },
};
//# sourceMappingURL=auth.service.js.map