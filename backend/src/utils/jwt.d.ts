export interface TokenPair {
    accessToken: string;
    refreshToken: string;
}
export interface JwtPayload {
    sub: string;
    role: string;
    email: string;
}
export declare const jwtUtils: {
    signAccessToken(payload: JwtPayload): any;
    signRefreshToken(payload: JwtPayload): any;
    verifyAccessToken(token: string): JwtPayload;
    verifyRefreshToken(token: string): JwtPayload;
};
//# sourceMappingURL=jwt.d.ts.map