import prisma from "../config/prisma.js";

export const adminService = {
  async getDashboardStats() {
    const [totalUsers, totalRefreshTokens] = await Promise.all([
      prisma.user.count(),
      prisma.refreshToken.count(),
    ]);

    return {
      totalUsers,
      totalRefreshTokens,
    };
  },
};
