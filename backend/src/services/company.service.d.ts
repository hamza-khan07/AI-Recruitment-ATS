import { type CompanySettingsParams, type CreateCompanyParams, type UpdateCompanyParams } from "../repositories/company.repository.js";
export declare const companyService: {
    createCompany(data: CreateCompanyParams, currentUserRole: string): Promise<any>;
    getCompanyProfile(currentUserId: string, currentUserRole: string): Promise<any>;
    upsertCompanyProfile(data: Partial<UpdateCompanyParams> & {
        name?: string;
    }, currentUserId: string, currentUserRole: string): Promise<any>;
    getCompanyById(companyId: string, currentUserId: string, currentUserRole: string): Promise<any>;
    getCompanyBySlug(slug: string, currentUserId: string, currentUserRole: string): Promise<any>;
    updateCompany(companyId: string, data: UpdateCompanyParams, currentUserId: string, currentUserRole: string): Promise<any>;
    deleteCompany(companyId: string, currentUserId: string, currentUserRole: string): Promise<any>;
    getCompanySettings(companyId: string, currentUserId: string, currentUserRole: string): Promise<any>;
    updateCompanySettings(companyId: string, data: CompanySettingsParams, currentUserId: string, currentUserRole: string): Promise<any>;
    assignHrToCompany(userId: string, companyId: string, currentUserId: string, currentUserRole: string): Promise<any>;
};
//# sourceMappingURL=company.service.d.ts.map