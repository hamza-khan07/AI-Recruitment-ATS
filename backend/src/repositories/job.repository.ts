import prisma from "../config/prisma.js";

export interface CreateJobParams {
  companyId?: string;
  title: string;
  department?: string;
  employmentType?: string;
  workMode?: string;
  location?: string;
  salaryMin?: number;
  salaryMax?: number;
  experience?: string;
  openPositions?: number;
  applications?: number;
  skills?: string;
  qualifications?: string;
  description?: string;
  responsibilities?: string;
  requirements?: string;
  benefits?: string;
  deadline?: Date;
  status?: string;
  createdBy: string;
}

export interface UpdateJobParams {
  title?: string;
  department?: string;
  employmentType?: string;
  workMode?: string;
  location?: string;
  salaryMin?: number | null;
  salaryMax?: number | null;
  experience?: string;
  openPositions?: number | null;
  description?: string | null;
  responsibilities?: string | null;
  requirements?: string | null;
  qualifications?: string | null;
  skills?: string | null;
  benefits?: string | null;
  deadline?: Date | null;
  status?: string;
}

const anyPrisma = prisma as any;

export const jobRepository = {
  async createJob(data: CreateJobParams) {
    return anyPrisma.job.create({
      data: {
        companyId: data.companyId,
        title: data.title,
        department: data.department,
        employmentType: data.employmentType,
        workMode: data.workMode,
        location: data.location,
        salaryMin: data.salaryMin,
        salaryMax: data.salaryMax,
        experience: data.experience,
        openPositions: data.openPositions,
        applications: data.applications ?? 0,
        skills: data.skills,
        qualifications: data.qualifications,
        description: data.description,
        responsibilities: data.responsibilities,
        requirements: data.requirements,
        benefits: data.benefits,
        deadline: data.deadline,
        status: data.status,
        createdBy: data.createdBy,
      },
    });
  },

  async findJobById(id: string) {
    return anyPrisma.job.findUnique({ where: { id } });
  },

  async findJobsForCompany(companyId: string, skip = 0, take = 20, filters: any = {}) {
    const where: any = { companyId };

    if (filters.search) {
      where.OR = [
        { title: { contains: filters.search, mode: "insensitive" } },
        { department: { contains: filters.search, mode: "insensitive" } },
      ];
    }

    if (filters.status) {
      where.status = filters.status;
    }

    return anyPrisma.job.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip,
      take,
    });
  },

  async findPublishedJobs(skip = 0, take = 20, filters: any = {}) {
    const where: any = { status: "PUBLISHED" };

    if (filters.search) {
      where.OR = [
        { title: { contains: filters.search, mode: "insensitive" } },
        { department: { contains: filters.search, mode: "insensitive" } },
        { company: { name: { contains: filters.search, mode: "insensitive" } } },
      ];
    }
    
    if (filters.location) {
      where.location = { contains: filters.location, mode: "insensitive" };
    }

    if (filters.type) {
      where.employmentType = filters.type;
    }
    
    if (filters.experience) {
      where.experience = filters.experience;
    }

    const [jobs, total] = await Promise.all([
      anyPrisma.job.findMany({
        where,
        orderBy: { createdAt: "desc" },
        skip,
        take,
        include: {
          company: {
            select: {
              id: true,
              name: true,
              logo: true,
              address: true,
              size: true,
              description: true,
              websiteUrl: true,
            }
          }
        }
      }),
      anyPrisma.job.count({ where })
    ]);

    return { jobs, total };
  },

  async getPublishedJobById(id: string) {
    return anyPrisma.job.findFirst({
      where: { id, status: "PUBLISHED" },
      include: {
        company: {
          select: {
            id: true,
            name: true,
            logo: true,
            address: true,
            size: true,
            description: true,
            websiteUrl: true,
          }
        }
      }
    });
  },

  async countJobsForCompany(companyId: string, filters: any = {}) {
    const where: any = { companyId };

    if (filters.search) {
      where.OR = [
        { title: { contains: filters.search, mode: "insensitive" } },
        { department: { contains: filters.search, mode: "insensitive" } },
      ];
    }

    if (filters.status) {
      where.status = filters.status;
    }

    return anyPrisma.job.count({ where });
  },

  async updateJob(id: string, data: UpdateJobParams) {
    return anyPrisma.job.update({ where: { id }, data });
  },

  async countJobsByStatus(companyId: string, status: string) {
    return anyPrisma.job.count({ where: { companyId, status } });
  },

  async sumOpenPositions(companyId: string) {
    const result = await anyPrisma.job.aggregate({
      _sum: { openPositions: true },
      where: { companyId },
    });
    return result._sum.openPositions ?? 0;
  },

  async deleteJob(id: string) {
    return anyPrisma.job.delete({ where: { id } });
  },
};
