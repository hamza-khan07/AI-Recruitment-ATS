import { type AppRole } from "../repositories/auth.repository.js";
export interface AuthTokens {
    accessToken: string;
    refreshToken: string;
}
export declare const authService: {
    login(email: string, password: string): Promise<{
        accessToken: any;
        refreshToken: any;
        role: import("../../generated/prisma/enums.js").Role;
    }>;
    logout(refreshToken: string): Promise<void>;
    refreshTokens(refreshToken: string): Promise<{
        accessToken: any;
        refreshToken: any;
    }>;
    register(email: string, password: string, name: string | undefined, role: AppRole): Promise<{
        id: string;
        email: string;
        passwordHash: string;
        name: string | null;
        role: import("../../generated/prisma/enums.js").Role;
        isActive: boolean;
        createdAt: Date;
        updatedAt: Date;
    }>;
    forgotPassword(email: string): Promise<{
        userId: string;
        email: string;
    } | undefined>;
    parseExpiration(value: string): number;
};
//# sourceMappingURL=auth.service.d.ts.map