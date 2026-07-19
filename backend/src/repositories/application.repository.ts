import prisma from "../config/prisma.js";

const anyPrisma = prisma as any;

export const applicationRepository = {
  async create(data: {
    jobId: string;
    candidateId: string;
    fullName: string;
    email: string;
    phone?: string | null;
    resumeUrl?: string | null;
    coverLetter?: string | null;
  }) {
    return anyPrisma.application.create({
      data,
      include: {
        job: { select: { title: true, company: { select: { name: true } } } },
      },
    });
  },

  async findByJobIdAndCandidateId(jobId: string, candidateId: string) {
    return anyPrisma.application.findUnique({
      where: { jobId_candidateId: { jobId, candidateId } },
    });
  },

  async findByCandidateId(candidateId: string) {
    return anyPrisma.application.findMany({
      where: { candidateId },
      orderBy: { createdAt: "desc" },
      include: {
        job: {
          select: {
            id: true,
            title: true,
            location: true,
            employmentType: true,
            company: { select: { name: true, logo: true } },
          },
        },
      },
    });
  },

  /** HR: get all applications for jobs that belong to a given company */
  async findByCompanyId(
    companyId: string,
    filters: { status?: string; jobId?: string; search?: string; hasInterview?: boolean },
    page: number,
    perPage: number
  ) {
    const where: any = {
      job: { companyId },
    };
    if (filters.status) where.status = filters.status;
    if (filters.jobId) where.jobId = filters.jobId;
    if (filters.hasInterview) where.interviewDate = { not: null };
    if (filters.search) {
      where.OR = [
        { fullName: { contains: filters.search, mode: "insensitive" } },
        { email: { contains: filters.search, mode: "insensitive" } },
        { job: { title: { contains: filters.search, mode: "insensitive" } } },
      ];
    }

    const [items, total] = await Promise.all([
      anyPrisma.application.findMany({
        where,
        skip: (page - 1) * perPage,
        take: perPage,
        orderBy: filters.hasInterview ? { interviewDate: "asc" } : { createdAt: "desc" },
        include: {
          job: { select: { id: true, title: true, department: true } },
          candidate: {
            select: {
              id: true,
              name: true,
              email: true,
              candidateProfile: {
                select: { avatar: true, title: true, location: true },
              },
            },
          },
        },
      }),
      anyPrisma.application.count({ where }),
    ]);

    return { items, total, page, perPage, totalPages: Math.ceil(total / perPage) };
  },

  async findById(id: string) {
    return anyPrisma.application.findUnique({
      where: { id },
      include: {
        job: {
          select: {
            id: true,
            title: true,
            department: true,
            location: true,
            employmentType: true,
            company: { select: { id: true, name: true, logo: true } },
          },
        },
        candidate: {
          select: {
            id: true,
            name: true,
            email: true,
            candidateProfile: {
              include: { workExperience: true, education: true },
            },
          },
        },
      },
    });
  },

  async updateStatus(id: string, status: string) {
    return anyPrisma.application.update({
      where: { id },
      data: { status },
    });
  },

  async updateDetails(id: string, data: { rating?: number; notes?: string; interviewDate?: Date | null }) {
    return anyPrisma.application.update({
      where: { id },
      data,
    });
  },
};
