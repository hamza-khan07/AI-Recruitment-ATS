import { authRepository } from "../repositories/auth.repository.js";
import { companyRepository, type CompanySettingsParams, type CreateCompanyParams, type UpdateCompanyParams } from "../repositories/company.repository.js";

const slugify = (value: string) =>
  value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "") || "company";

const ensureAccess = async (companyId: string, currentUserId: string, currentUserRole: string, allowHrAccess = false) => {
  const company = await companyRepository.findCompanyById(companyId);

  if (!company) {
    throw new Error("Company not found.");
  }

  if (currentUserRole === "SUPER_ADMIN") {
    return company;
  }

  if (company.ownerId === currentUserId) {
    return company;
  }

  if (allowHrAccess) {
    const user = await authRepository.findUserById(currentUserId);
    if (user && (user as any)?.companyId === companyId && user.role === "HR") {
      return company;
    }
  }

  throw new Error("Unauthorized to access this company.");
};

export const companyService = {
  async createCompany(data: CreateCompanyParams, currentUserRole: string) {
    if (currentUserRole !== "SUPER_ADMIN") {
      throw new Error("Only SUPER_ADMIN can create companies.");
    }

    const existing = await companyRepository.findCompanyBySlug(data.slug);

    if (existing) {
      throw new Error("Company slug is already in use.");
    }

    const company = await companyRepository.createCompany(data);
    await companyRepository.upsertCompanySettings(company.id, {});
    return company;
  },

  async getCompanyProfile(currentUserId: string, currentUserRole: string) {
    const user = await authRepository.findUserById(currentUserId);

    if (!user) {
      throw new Error("User not found.");
    }

    const companyId = (user as any).companyId;

    if (!companyId) {
      return null;
    }

    return companyRepository.findCompanyById(companyId);
  },

  async upsertCompanyProfile(data: Partial<UpdateCompanyParams> & { name?: string }, currentUserId: string, currentUserRole: string) {
    if (currentUserRole !== "HR" && currentUserRole !== "SUPER_ADMIN") {
      throw new Error("Only HR or SUPER_ADMIN can manage company profile.");
    }

    const user = await authRepository.findUserById(currentUserId);

    if (!user) {
      throw new Error("User not found.");
    }

    const companyData = {
      name: data.name ?? user.name ?? "Company",
      slug: slugify(data.name ?? user.name ?? "Company"),
      ownerId: currentUserId,
      websiteUrl: (data as any).websiteUrl ?? (data as any).website,
      description: data.description,
      email: data.email,
      phone: data.phone,
      address: data.address,
      logo: data.logo,
      size: (data as any).size,
    } as CreateCompanyParams;

    const companyId = (user as any).companyId;

    if (companyId) {
      return companyRepository.updateCompany(companyId, companyData);
    }

    const company = await companyRepository.createCompany(companyData);
    await companyRepository.assignHrToCompany(currentUserId, company.id);
    await companyRepository.upsertCompanySettings(company.id, {});
    return company;
  },

  async getCompanyById(companyId: string, currentUserId: string, currentUserRole: string) {
    await ensureAccess(companyId, currentUserId, currentUserRole, true);
    return companyRepository.findCompanyById(companyId);
  },

  async getCompanyBySlug(slug: string, currentUserId: string, currentUserRole: string) {
    const company = await companyRepository.findCompanyBySlug(slug);

    if (!company) {
      throw new Error("Company not found.");
    }

    await ensureAccess(company.id, currentUserId, currentUserRole, true);
    return company;
  },

  async updateCompany(companyId: string, data: UpdateCompanyParams, currentUserId: string, currentUserRole: string) {
    const company = await companyRepository.findCompanyById(companyId);

    if (!company) {
      throw new Error("Company not found.");
    }

    if (currentUserRole !== "SUPER_ADMIN" && company.ownerId !== currentUserId) {
      throw new Error("Unauthorized to update this company.");
    }

    if (data.slug && data.slug !== company.slug) {
      const existing = await companyRepository.findCompanyBySlug(data.slug);
      if (existing && existing.id !== companyId) {
        throw new Error("Company slug is already in use.");
      }
    }

    return companyRepository.updateCompany(companyId, data);
  },

  async deleteCompany(companyId: string, currentUserId: string, currentUserRole: string) {
    const company = await companyRepository.findCompanyById(companyId);

    if (!company) {
      throw new Error("Company not found.");
    }

    if (currentUserRole !== "SUPER_ADMIN" && company.ownerId !== currentUserId) {
      throw new Error("Unauthorized to delete this company.");
    }

    return companyRepository.deleteCompany(companyId);
  },

  async getCompanySettings(companyId: string, currentUserId: string, currentUserRole: string) {
    await ensureAccess(companyId, currentUserId, currentUserRole, true);
    return companyRepository.findCompanySettings(companyId);
  },

  async updateCompanySettings(companyId: string, data: CompanySettingsParams, currentUserId: string, currentUserRole: string) {
    await ensureAccess(companyId, currentUserId, currentUserRole, true);
    return companyRepository.upsertCompanySettings(companyId, data);
  },

  async assignHrToCompany(userId: string, companyId: string, currentUserId: string, currentUserRole: string) {
    if (currentUserRole !== "SUPER_ADMIN") {
      throw new Error("Unauthorized to assign HR to this company.");
    }

    const company = await companyRepository.findCompanyById(companyId);

    if (!company) {
      throw new Error("Company not found.");
    }

    const user = await authRepository.findUserById(userId);

    if (!user) {
      throw new Error("User not found.");
    }

    return companyRepository.assignHrToCompany(userId, companyId);
  },
};
