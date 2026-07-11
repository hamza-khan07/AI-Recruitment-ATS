import { PrismaClient } from "../../generated/prisma/client.ts";
import { PrismaPg } from "@prisma/adapter-pg";
import { env } from "./env.js";

declare global {
  // eslint-disable-next-line no-var
  var __prismaClient__: PrismaClient | undefined;
}

const prismaClient = globalThis.__prismaClient__;

const prismaOptions = {
  adapter: new PrismaPg({ connectionString: env.prismaDatabaseUrl }),
  log: env.nodeEnv === "development"
    ? ["query", "info", "warn", "error"]
    : ["error"],
};

const prisma = prismaClient ?? new PrismaClient(prismaOptions as any);

if (env.nodeEnv === "development") {
  globalThis.__prismaClient__ = prisma;
}

export default prisma;
