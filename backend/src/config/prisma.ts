import { PrismaClient } from "../../generated/prisma/client.js";
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

// Disable globalThis cache temporarily to force the new schema to load
const prisma = new PrismaClient(prismaOptions as any);

export default prisma;
