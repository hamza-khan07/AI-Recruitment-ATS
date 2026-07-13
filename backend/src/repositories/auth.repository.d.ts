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
export declare const authRepository: {
    findUserByEmail(email: string): Promise<{
        id: string;
        email: string;
        passwordHash: string;
        name: string | null;
        role: import("../../generated/prisma/enums.js").Role;
        isActive: boolean;
        createdAt: Date;
        updatedAt: Date;
        companyId: string | null;
    } | null>;
    findUserById(id: string): Promise<{
        id: string;
        email: string;
        passwordHash: string;
        name: string | null;
        role: import("../../generated/prisma/enums.js").Role;
        isActive: boolean;
        createdAt: Date;
        updatedAt: Date;
        companyId: string | null;
    } | null>;
    createUser(data: CreateUserParams): Promise<{
        id: string;
        email: string;
        passwordHash: string;
        name: string | null;
        role: import("../../generated/prisma/enums.js").Role;
        isActive: boolean;
        createdAt: Date;
        updatedAt: Date;
        companyId: string | null;
    }>;
    saveRefreshToken({ token, userId, expiresAt }: RefreshTokenRecord): Promise<{
        token: string;
        userId: string;
        expiresAt: Date;
        id: string;
        createdAt: Date;
    }>;
    revokeRefreshToken(token: string): Promise<import("../../generated/prisma/internal/prismaNamespace.js").BatchPayload>;
    revokeAllRefreshTokensForUser(userId: string): Promise<import("../../generated/prisma/internal/prismaNamespace.js").BatchPayload>;
    findRefreshToken(token: string): Promise<{
        token: string;
        userId: string;
        expiresAt: Date;
        id: string;
        createdAt: Date;
    } | null>;
};
//# sourceMappingURL=auth.repository.d.ts.map