import prisma from "../config/prisma.js";

export interface CreateCompanyParams {
  name: string;
  slug: string;
  ownerId: string;
  careerPageUrl?: string;
  logoUrl?: string;
  websiteUrl?: string;
  description?: string;
}

export interface UpdateCompanyParams {
  name?: string;
  slug?: string;
  careerPageUrl?: string;
  logoUrl?: string;
  websiteUrl?: string;
  description?: string;
}

export interface CompanySettingsParams {
  locale?: string;
  timezone?: string;
  billingEmail?: string;
  timezoneOffset?: number;
  metadata?: Record<string, unknown>;
}

export const companyRepository = {
  async createCompany(data: CreateCompanyParams) {
    return prisma.company.create({
      data: {
        name: data.name,
        slug: data.slug,
        ownerId: data.ownerId,
        careerPageUrl: data.careerPageUrl,
        logoUrl: data.logoUrl,
        websiteUrl: data.websiteUrl,
        description: data.description,
      },
    });
  },

  async findCompanyById(id: string) {
    return prisma.company.findUnique({
      where: { id },
      include: {
        settings: true,
      },
    });
  },

  async findCompanyBySlug(slug: string) {
    return prisma.company.findUnique({
      where: { slug },
      include: {
        settings: true,
      },
    });
  },

  async findCompanyByOwnerId(ownerId: string) {
    return prisma.company.findFirst({
      where: { ownerId },
      include: {
        settings: true,
      },
    });
  },

  async updateCompany(id: string, data: UpdateCompanyParams) {
    return prisma.company.update({
      where: { id },
      data: {
        name: data.name,
        slug: data.slug,
        careerPageUrl: data.careerPageUrl,
        logoUrl: data.logoUrl,
        websiteUrl: data.websiteUrl,
        description: data.description,
      },
    });
  },

  async deleteCompany(id: string) {
    return prisma.company.delete({
      where: { id },
    });
  },

  async findCompanySettings(companyId: string) {
    return prisma.companySettings.findUnique({
      where: { companyId },
    });
  },

  async upsertCompanySettings(companyId: string, data: CompanySettingsParams) {
    return prisma.companySettings.upsert({
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

  async assignHrToCompany(userId: string, companyId: string) {
    return prisma.user.update({
      where: { id: userId },
      data: { companyId },
    });
  },
};
