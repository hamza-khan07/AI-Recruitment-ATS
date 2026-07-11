import dotenv from "dotenv";
import path from "node:path";

dotenv.config({ path: path.resolve(process.cwd(), ".env") });

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

const getEnvNumber = (key: string, fallback: number): number => {
  const value = process.env[key];

  if (!value) {
    return fallback;
  }

  const parsed = Number(value);

  if (Number.isNaN(parsed)) {
    throw new Error(`Environment variable ${key} must be a valid number.`);
  }

  return parsed;
};

const getEnvString = (key: string, fallback: string): string => {
  const value = process.env[key];

  if (!value) {
    return fallback;
  }

  return value;
};

const envConfig: EnvConfig = {
  nodeEnv: getEnvString("NODE_ENV", "development"),
  port: getEnvNumber("PORT", 5000),
  apiPrefix: getEnvString("API_PREFIX", "/api/v1"),
  prismaDatabaseUrl: getEnvString("DATABASE_URL", ""),
  accessTokenSecret: getEnvString("ACCESS_TOKEN_SECRET", "supersecret_access"),
  refreshTokenSecret: getEnvString("REFRESH_TOKEN_SECRET", "supersecret_refresh"),
  accessTokenExpiresIn: getEnvString("ACCESS_TOKEN_EXPIRES_IN", "15m"),
  refreshTokenExpiresIn: getEnvString("REFRESH_TOKEN_EXPIRES_IN", "7d"),
  bcryptSaltRounds: getEnvNumber("BCRYPT_SALT_ROUNDS", 12),
};

export const env = envConfig;

export default env;
