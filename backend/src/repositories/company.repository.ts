import prisma from "../config/prisma.js";

export interface CreateCompanyParams {
  name: string;
  slug: string;
  ownerId: string;
  careerPageUrl?: string;
  logoUrl?: string;
  logo?: string;
  websiteUrl?: string;
  description?: string;
  email?: string;
  phone?: string;
  address?: string;
}

export interface UpdateCompanyParams {
  name?: string;
  slug?: string;
  careerPageUrl?: string;
  logoUrl?: string;
  logo?: string;
  websiteUrl?: string;
  description?: string;
  email?: string;
  phone?: string;
  address?: string;
}

export interface CompanySettingsParams {
  locale?: string;
  timezone?: string;
  billingEmail?: string;
  timezoneOffset?: number;
  metadata?: Record<string, unknown>;
}

const anyPrisma = prisma as any;

export const companyRepository = {
  async createCompany(data: CreateCompanyParams) {
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

  async findCompanyById(id: string) {
    return anyPrisma.company.findUnique({
      where: { id },
      include: {
        settings: true,
      },
    });
  },

  async findCompanyBySlug(slug: string) {
    return anyPrisma.company.findUnique({
      where: { slug },
      include: {
        settings: true,
      },
    });
  },

  async findCompanyByOwnerId(ownerId: string) {
    return anyPrisma.company.findFirst({
      where: { ownerId },
      include: {
        settings: true,
      },
    });
  },

  async updateCompany(id: string, data: UpdateCompanyParams) {
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

  async deleteCompany(id: string) {
    return anyPrisma.company.delete({
      where: { id },
    });
  },

  async findCompanySettings(companyId: string) {
    return anyPrisma.companySettings.findUnique({
      where: { companyId },
    });
  },

  async upsertCompanySettings(companyId: string, data: CompanySettingsParams) {
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

  async assignHrToCompany(userId: string, companyId: string) {
    return anyPrisma.user.update({
      where: { id: userId },
      data: { companyId },
    });
  },
};
