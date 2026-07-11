import jwt from "jsonwebtoken";
import { env } from "../config/env.js";

export interface TokenPair {
  accessToken: string;
  refreshToken: string;
}

export interface JwtPayload {
  sub: string;
  role: string;
  email: string;
}

export const jwtUtils = {
  signAccessToken(payload: JwtPayload) {
    return jwt.sign(payload, env.accessTokenSecret, {
      expiresIn: env.accessTokenExpiresIn,
    });
  },

  signRefreshToken(payload: JwtPayload) {
    return jwt.sign(payload, env.refreshTokenSecret, {
      expiresIn: env.refreshTokenExpiresIn,
    });
  },

  verifyAccessToken(token: string) {
    return jwt.verify(token, env.accessTokenSecret) as JwtPayload;
  },

  verifyRefreshToken(token: string) {
    return jwt.verify(token, env.refreshTokenSecret) as JwtPayload;
  },
};
