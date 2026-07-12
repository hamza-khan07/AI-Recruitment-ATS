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
export declare const companyRepository: {
    createCompany(data: CreateCompanyParams): Promise<any>;
    findCompanyById(id: string): Promise<any>;
    findCompanyBySlug(slug: string): Promise<any>;
    findCompanyByOwnerId(ownerId: string): Promise<any>;
    updateCompany(id: string, data: UpdateCompanyParams): Promise<any>;
    deleteCompany(id: string): Promise<any>;
    findCompanySettings(companyId: string): Promise<any>;
    upsertCompanySettings(companyId: string, data: CompanySettingsParams): Promise<any>;
    assignHrToCompany(userId: string, companyId: string): Promise<any>;
};
//# sourceMappingURL=company.repository.d.ts.map