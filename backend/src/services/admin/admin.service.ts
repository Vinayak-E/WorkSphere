import { IJwtService } from "../../interfaces/IJwtService.types";
import { IAdminRepository, IAdminService } from "../../interfaces/admin/admin.types";

import bcrypt from 'bcryptjs'
import { ICompanyRepository } from "../../interfaces/company/company.types";
import { sendEmail } from "../../utils/email";
import { companyApprovalTemplates } from "../../helpers/emailTemplate";
export class AdminService implements IAdminService {
  constructor(
    private jwtService: IJwtService,
    private adminRepository: IAdminRepository,
    private companyRepository: ICompanyRepository
  ) {}

  async verifyAdmin(
    email: string,
    password: string
  ): Promise<{
    refreshToken: string;
    accessToken: string;
  } | null> {
    try {
      console.log("email at service", email);
      const admin = await this.adminRepository.findByEmail(email);

      if (!admin || admin.role !== "ADMIN") {
        return null;
      }

      const isValidPassword = await bcrypt.compare(password, admin.password);

      if (!isValidPassword) {
        return null;
      }
      const tenantId = "ADMIN";
      const data = {
        tenantId,
        email: admin.email,
        role: admin.role,
      };

      const [accessToken, refreshToken] = await Promise.all([
        this.jwtService.generateAccessToken(data),
        this.jwtService.generateRefreshToken(data),
      ]);

      return { accessToken, refreshToken };
    } catch (error) {
      console.error("Error verifying login:", error);
      throw new Error("Login failed");
    }
  }

  async getCompanies(): Promise<any> {
    try {
      const companies = await this.adminRepository.findCompanies();
      return companies;
    } catch (error) {
      console.error("Error fetching companies:", error);
      throw new Error("Failed to fetch companies");
    }
  }

  async updateCompanyStatus(companyId: string, isActive: boolean) {
    return await this.adminRepository.updateStatus(companyId, isActive);
  }

  async updateCompanyRequest(
    companyId: string,
    isApproved: string,
    reason: string
  ) {
    const company = await this.adminRepository.updateRequest(
      companyId,
      isApproved
    );
    if (company) {
      const subject =
        isApproved === "Approved"
          ? "Your Company Registration on WorkSphere Has Been Approved"
          : "Update on Your Company Registration Request";

      const message =
        isApproved === "Approved"
          ? companyApprovalTemplates.approved(company.companyName)
          : companyApprovalTemplates.rejected(company.companyName, reason);

      await sendEmail(company.email, subject, message);
    }

    return company;
  }
}
