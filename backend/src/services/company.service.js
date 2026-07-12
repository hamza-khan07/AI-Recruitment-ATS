import { authRepository } from "../repositories/auth.repository.js";
import { companyRepository } from "../repositories/company.repository.js";
const slugify = (value) => value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "") || "company";
const ensureAccess = async (companyId, currentUserId, currentUserRole, allowHrAccess = false) => {
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
        if (user && user?.companyId === companyId && user.role === "HR") {
            return company;
        }
    }
    throw new Error("Unauthorized to access this company.");
};
export const companyService = {
    async createCompany(data, currentUserRole) {
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
    async getCompanyProfile(currentUserId, currentUserRole) {
        const user = await authRepository.findUserById(currentUserId);
        if (!user) {
            throw new Error("User not found.");
        }
        const companyId = user.companyId;
        if (!companyId) {
            return null;
        }
        return companyRepository.findCompanyById(companyId);
    },
    async upsertCompanyProfile(data, currentUserId, currentUserRole) {
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
            websiteUrl: data.websiteUrl ?? data.website,
            description: data.description,
            email: data.email,
            phone: data.phone,
            address: data.address,
            logo: data.logo,
        };
        const companyId = user.companyId;
        if (companyId) {
            return companyRepository.updateCompany(companyId, companyData);
        }
        const company = await companyRepository.createCompany(companyData);
        await companyRepository.assignHrToCompany(currentUserId, company.id);
        await companyRepository.upsertCompanySettings(company.id, {});
        return company;
    },
    async getCompanyById(companyId, currentUserId, currentUserRole) {
        await ensureAccess(companyId, currentUserId, currentUserRole, true);
        return companyRepository.findCompanyById(companyId);
    },
    async getCompanyBySlug(slug, currentUserId, currentUserRole) {
        const company = await companyRepository.findCompanyBySlug(slug);
        if (!company) {
            throw new Error("Company not found.");
        }
        await ensureAccess(company.id, currentUserId, currentUserRole, true);
        return company;
    },
    async updateCompany(companyId, data, currentUserId, currentUserRole) {
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
    async deleteCompany(companyId, currentUserId, currentUserRole) {
        const company = await companyRepository.findCompanyById(companyId);
        if (!company) {
            throw new Error("Company not found.");
        }
        if (currentUserRole !== "SUPER_ADMIN" && company.ownerId !== currentUserId) {
            throw new Error("Unauthorized to delete this company.");
        }
        return companyRepository.deleteCompany(companyId);
    },
    async getCompanySettings(companyId, currentUserId, currentUserRole) {
        await ensureAccess(companyId, currentUserId, currentUserRole, true);
        return companyRepository.findCompanySettings(companyId);
    },
    async updateCompanySettings(companyId, data, currentUserId, currentUserRole) {
        await ensureAccess(companyId, currentUserId, currentUserRole, true);
        return companyRepository.upsertCompanySettings(companyId, data);
    },
    async assignHrToCompany(userId, companyId, currentUserId, currentUserRole) {
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
//# sourceMappingURL=company.service.js.map