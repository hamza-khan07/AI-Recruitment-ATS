import prisma from "../config/prisma.js";

export type AppRole = "SUPER_ADMIN" | "HR" | "CANDIDATE";

export interface CreateUserParams {
  email: string;
  passwordHash: string;
  name?: string;
  role: AppRole;
}

export interface RefreshTokenRecord {
  token: string;
  userId: string;
  expiresAt: Date;
}

export const authRepository = {
  async findUserByEmail(email: string) {
    return prisma.user.findUnique({ where: { email } });
  },

  async findUserById(id: string) {
    return prisma.user.findUnique({ where: { id } });
  },

  async createUser(data: CreateUserParams) {
    return prisma.user.create({ data });
  },

  async saveRefreshToken({ token, userId, expiresAt }: RefreshTokenRecord) {
    return prisma.refreshToken.create({
      data: {
        token,
        userId,
        expiresAt,
      },
    });
  },

  async revokeRefreshToken(token: string) {
    return prisma.refreshToken.deleteMany({ where: { token } });
  },

  async revokeAllRefreshTokensForUser(userId: string) {
    return prisma.refreshToken.deleteMany({ where: { userId } });
  },

  async findRefreshToken(token: string) {
    return prisma.refreshToken.findUnique({ where: { token } });
  },
};
