import prisma from "./src/config/prisma.js";

async function test() {
  try {
    const jobs = await prisma.job.findMany({
      where: { companyId: "some-id" },
      orderBy: { createdAt: "desc" },
      skip: 0,
      take: 10,
    });
    console.log("findMany success", jobs.length);

    const active = await prisma.job.count({
      where: { companyId: "some-id", status: "PUBLISHED" },
    });
    console.log("count PUBLISHED success", active);

    const inactive = await prisma.job.count({
      where: { companyId: "some-id", status: "DRAFT" },
    });
    console.log("count DRAFT success", inactive);

    const openings = await prisma.job.aggregate({
      _sum: { openPositions: true },
      where: { companyId: "some-id" },
    });
    console.log("aggregate openPositions success", openings);

  } catch (err) {
    console.error("PRISMA ERROR:");
    console.error(err);
  } finally {
    await prisma.$disconnect();
  }
}

test();
