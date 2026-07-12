import { PrismaClient } from "../../generated/prisma/client.js";
import { PrismaPg } from "@prisma/adapter-pg";
import { env } from "./env.js";
const prismaClient = globalThis.__prismaClient__;
const prismaOptions = {
    adapter: new PrismaPg({ connectionString: env.prismaDatabaseUrl }),
    log: env.nodeEnv === "development"
        ? ["query", "info", "warn", "error"]
        : ["error"],
};
const prisma = prismaClient ?? new PrismaClient(prismaOptions);
if (env.nodeEnv === "development") {
    globalThis.__prismaClient__ = prisma;
}
export default prisma;
//# sourceMappingURL=prisma.js.map