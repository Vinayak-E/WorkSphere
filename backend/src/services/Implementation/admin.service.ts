import { injectable, inject } from 'tsyringe';
import bcrypt from 'bcryptjs';
import { sendEmail } from '../../utils/email';
import { companyApprovalTemplates } from '../../helpers/emailTemplate';
import { generateCompanySlug } from '../../helpers/helperFunctions';
import { IUser } from '../../interfaces/IUser.types';
import { JwtService } from '../jwt.service';
import { CompanyRepository } from '../../repositories/Implementation/company.repository';
import { connectTenantDB } from '../../configs/db.config';
import { AdminRepository } from '../../repositories/Implementation/admin.repository';
import { UserRepository } from '../../repositories/Implementation/user.repository';
import { CompanyRequestRepository } from '../../repositories/Implementation/companyRequest.repository';

@injectable()
export class AdminService implements AdminService {
  constructor(
    @inject('JwtService') private jwtService: JwtService,
    @inject('AdminRepository') private adminRepository: AdminRepository,
    @inject('CompanyRepository') private companyRepository: CompanyRepository,
    @inject('CompanyRequestRepository') private companyRequestRepository: CompanyRequestRepository,
    @inject('UserRepository') private userRepository: UserRepository
  ) {}

  async verifyAdmin(
    email: string,
    password: string
  ): Promise<{ refreshToken: string; accessToken: string } | null> {
    const admin = await this.userRepository.findByEmail(email);
    if (!admin || admin.role !== 'ADMIN') return null;

    const isValidPassword = await bcrypt.compare(password, admin.password);
    if (!isValidPassword) return null;

    const tenantId = 'ADMIN';
    const data = { tenantId, email: admin.email, role: admin.role };

    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.generateAccessToken(data),
      this.jwtService.generateRefreshToken(data)
    ]);

    return { accessToken, refreshToken };
  }

  async getProfile(email: string): Promise<IUser | null> {
    return await this.userRepository.findByEmail(email);
  }

  async getCompanies(): Promise<any> {
    return await this.adminRepository.findAll();
  }
  async getCompanyRequests(): Promise<any> {
    return await this.companyRequestRepository.find();
  }
  async updateCompanyStatus(companyId: string, isActive: boolean) {
    return await this.userRepository.updateStatus(companyId, isActive);
  }

  async updateCompanyRequest(companyId: string, isApproved: string, reason: string) {
    const reqCompany = await this.companyRequestRepository.findById(companyId)
    console.log("reqCOmpany",reqCompany)
    if(!reqCompany?.email) return
    const com = await this.userRepository.findByEmail(reqCompany?.email)
    if(!com) return
    const company = await this.userRepository.updateRequest(com._id, isApproved);

    if (company && isApproved === 'Approved') {
      const tempCompany = await this.companyRequestRepository.findByEmail(company.email);
      if (!tempCompany) throw new Error('Temp company not found');

      const tenantId = generateCompanySlug(company.companyName);
      const tenantConnection = await connectTenantDB(tenantId);
      await this.companyRepository.createTenantCompany(tenantId, tempCompany, tenantConnection);
      await this.adminRepository.createCompany(tempCompany);
 
      await this.companyRequestRepository.delete(companyId);

      const subject = 'Your Company Registration on WorkSphere Has Been Approved';
      const message = companyApprovalTemplates.approved(company.companyName);
      await sendEmail(company.email, subject, message);
    } else if (company && isApproved !== 'Approved') {
      const subject = 'Update on Your Company Registration Request';
      const message = companyApprovalTemplates.rejected(company.companyName, reason);
      await sendEmail(company.email, subject, message);
    }

    return company;
  }
}
