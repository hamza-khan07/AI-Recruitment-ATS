import jwt from "jsonwebtoken";
import { env } from "../config/env.js";
export const jwtUtils = {
    signAccessToken(payload) {
        return jwt.sign(payload, env.accessTokenSecret, {
            expiresIn: env.accessTokenExpiresIn,
        });
    },
    signRefreshToken(payload) {
        return jwt.sign(payload, env.refreshTokenSecret, {
            expiresIn: env.refreshTokenExpiresIn,
        });
    },
    verifyAccessToken(token) {
        return jwt.verify(token, env.accessTokenSecret);
    },
    verifyRefreshToken(token) {
        return jwt.verify(token, env.refreshTokenSecret);
    },
};
//# sourceMappingURL=jwt.js.map