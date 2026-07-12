interface EnvConfig {
    nodeEnv: string;
    port: number;
    apiPrefix: string;
    prismaDatabaseUrl: string;
    accessTokenSecret: string;
    refreshTokenSecret: string;
    accessTokenExpiresIn: string;
    refreshTokenExpiresIn: string;
    bcryptSaltRounds: number;
}
export declare const env: EnvConfig;
export default env;
//# sourceMappingURL=env.d.ts.map