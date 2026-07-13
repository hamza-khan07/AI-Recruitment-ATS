import prisma from "../config/prisma.js";
const anyPrisma = prisma;
export const jobRepository = {
    async createJob(data) {
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
    async findJobById(id) {
        return anyPrisma.job.findUnique({ where: { id } });
    },
    async findJobsForCompany(companyId, skip = 0, take = 20, filters = {}) {
        const where = { companyId };
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
    async countJobsForCompany(companyId, filters = {}) {
        const where = { companyId };
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
    async updateJob(id, data) {
        return anyPrisma.job.update({ where: { id }, data });
    },
    async countJobsByStatus(companyId, status) {
        return anyPrisma.job.count({ where: { companyId, status } });
    },
    async sumOpenPositions(companyId) {
        return anyPrisma.job.aggregate({
            _sum: { openPositions: true },
            where: { companyId },
        })._sum.openPositions ?? 0;
    },
    async deleteJob(id) {
        return anyPrisma.job.delete({ where: { id } });
    },
};
//# sourceMappingURL=job.repository.js.map