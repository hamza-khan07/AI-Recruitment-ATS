import prisma from "../config/prisma.js";
const anyPrisma = prisma;
export const companyRepository = {
    async createCompany(data) {
        return anyPrisma.company.create({
            data: {
                name: data.name,
                slug: data.slug,
                ownerId: data.ownerId,
                careerPageUrl: data.careerPageUrl,
                logo: data.logo ?? data.logoUrl,
                websiteUrl: data.websiteUrl,
                description: data.description,
                email: data.email,
                phone: data.phone,
                address: data.address,
            },
        });
    },
    async findCompanyById(id) {
        return anyPrisma.company.findUnique({
            where: { id },
            include: {
                settings: true,
            },
        });
    },
    async findCompanyBySlug(slug) {
        return anyPrisma.company.findUnique({
            where: { slug },
            include: {
                settings: true,
            },
        });
    },
    async findCompanyByOwnerId(ownerId) {
        return anyPrisma.company.findFirst({
            where: { ownerId },
            include: {
                settings: true,
            },
        });
    },
    async updateCompany(id, data) {
        return anyPrisma.company.update({
            where: { id },
            data: {
                name: data.name,
                slug: data.slug,
                careerPageUrl: data.careerPageUrl,
                logo: data.logo ?? data.logoUrl,
                websiteUrl: data.websiteUrl,
                description: data.description,
                email: data.email,
                phone: data.phone,
                address: data.address,
            },
        });
    },
    async deleteCompany(id) {
        return anyPrisma.company.delete({
            where: { id },
        });
    },
    async findCompanySettings(companyId) {
        return anyPrisma.companySettings.findUnique({
            where: { companyId },
        });
    },
    async upsertCompanySettings(companyId, data) {
        return anyPrisma.companySettings.upsert({
            where: { companyId },
            create: {
                companyId,
                locale: data.locale,
                timezone: data.timezone,
                billingEmail: data.billingEmail,
                timezoneOffset: data.timezoneOffset,
                metadata: data.metadata ?? {},
            },
            update: {
                locale: data.locale,
                timezone: data.timezone,
                billingEmail: data.billingEmail,
                timezoneOffset: data.timezoneOffset,
                metadata: data.metadata ?? {},
            },
        });
    },
    async assignHrToCompany(userId, companyId) {
        return anyPrisma.user.update({
            where: { id: userId },
            data: { companyId },
        });
    },
};
//# sourceMappingURL=company.repository.js.map