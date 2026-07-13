import prisma from "./src/config/prisma.js";
const anyPrisma = prisma;

async function test() {
  try {
    const res = anyPrisma.job.aggregate({
      _sum: { openPositions: true },
      where: { companyId: "some-id" },
    })._sum.openPositions ?? 0;
    console.log("res:", res);
  } catch (err) {
    console.error("ERROR:", err.message);
  } finally {
    await prisma.$disconnect();
  }
}

test();
