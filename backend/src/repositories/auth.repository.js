import prisma from "../config/prisma.js";
export const authRepository = {
    async findUserByEmail(email) {
        return prisma.user.findUnique({ where: { email } });
    },
    async findUserById(id) {
        return prisma.user.findUnique({ where: { id } });
    },
    async createUser(data) {
        return prisma.user.create({ data });
    },
    async saveRefreshToken({ token, userId, expiresAt }) {
        return prisma.refreshToken.create({
            data: {
                token,
                userId,
                expiresAt,
            },
        });
    },
    async revokeRefreshToken(token) {
        return prisma.refreshToken.deleteMany({ where: { token } });
    },
    async revokeAllRefreshTokensForUser(userId) {
        return prisma.refreshToken.deleteMany({ where: { userId } });
    },
    async findRefreshToken(token) {
        return prisma.refreshToken.findUnique({ where: { token } });
    },
};
//# sourceMappingURL=auth.repository.js.map