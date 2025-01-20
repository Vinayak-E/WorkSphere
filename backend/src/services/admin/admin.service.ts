import { IJwtService } from "../../interfaces/IJwtService.types";
import { IAdminRepository, IAdminService } from "../../interfaces/admin/admin.types";

import bcrypt from 'bcryptjs'
import { ICompanyRepository } from "../../interfaces/company/company.types";
import { sendEmail } from "../../utils/email";
export class AdminService implements IAdminService {
  constructor(
    private jwtService: IJwtService,
    private adminRepository: IAdminRepository,
    private companyRepository: ICompanyRepository
  ) {}

  async verifyAdmin(email: string, password: string): Promise<{
    refreshToken: string;
    accessToken: string;
  } | null> {
    try {
        console.log('email at service',email)
      const admin = await this.adminRepository.findByEmail(email);
      
      if (!admin || admin.role !== "ADMIN") {
        return null;
      }

      const isValidPassword = await bcrypt.compare(password, admin.password);
     
      if (!isValidPassword) {
        return null;
      }
      const tenantId ='ADMIN'
      const data = {
        tenantId,
        email: admin.email,
        role: admin.role,
      };

      const [accessToken, refreshToken] = await Promise.all([
        this.jwtService.generateAccessToken(data),
        this.jwtService.generateRefreshToken(data)
      ]);

      return { accessToken, refreshToken };
    } catch (error) {
      console.error('Error verifying login:', error);
      throw new Error('Login failed');
    }
  }

  async getCompanies(): Promise<any> {
    try {
      const companies = await this.adminRepository.findCompanies();
      return companies
    } catch (error) {
      console.error("Error fetching companies:", error);
      throw new Error("Failed to fetch companies");
    }
  }

  async updateCompanyStatus(companyId: string, isActive: boolean) {
    return await this.adminRepository.updateStatus(companyId, isActive);
  }


  async updateCompanyRequest(companyId: string, isApproved: string, reason: string) {
    const company = await this.adminRepository.updateRequest(companyId, isApproved);

    if (company) {
      const subject =
        isApproved === "Approved"
          ? "Your Company Registration on WorkSphere Has Been Approved"
          : "Update on Your Company Registration Request";

      const message =
        isApproved === "Approved"
          ? `Dear ${company.companyName},

          We are pleased to inform you that your request to register your company on WorkSphere has been **approved**. You can
          now access all the features and opportunities available on our platform.

          If you have any questions, feel free to contact our support team.

          Best regards,
          The WorkSphere Team`
                  : `Dear ${company.companyName},

          Thank you for your interest in registering your company on WorkSphere. After reviewing your application, we regret to
          inform you that your request has been **rejected** due to the following reason:

          **${reason}**

          We appreciate your time and effort in applying. If you have any questions or believe this was a misunderstanding,
          feel free to reach out to our support team.

          Best regards,
          The WorkSphere Team`;

      await sendEmail(company.email, subject, message);
    }

    return company;
}


}
