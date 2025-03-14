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
import { ISubscriptionRepository } from '../../repositories/Interface/ISubscriptionRepository';

@injectable()
export class AdminService implements AdminService {
  constructor(
    @inject('JwtService') private jwtService: JwtService,
    @inject('AdminRepository') private adminRepository: AdminRepository,
    @inject('CompanyRepository') private companyRepository: CompanyRepository,
    @inject('CompanyRequestRepository')
    private companyRequestRepository: CompanyRequestRepository,
    @inject('UserRepository') private userRepository: UserRepository,
    @inject('SubscriptionRepository')
    private subscriptionRepository: ISubscriptionRepository
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
      this.jwtService.generateRefreshToken(data),
    ]);

    return { accessToken, refreshToken };
  }

  async getProfile(email: string): Promise<IUser | null> {
    return await this.userRepository.findByEmail(email);
  }

  async getCompanies(): Promise<any> {
    return await this.userRepository.findAll({ role: 'COMPANY' });
  }

  async getCompanyRequests(): Promise<any> {
    return await this.companyRequestRepository.find();
  }
  async updateCompanyStatus(companyId: string, isActive: boolean) {
    return await this.userRepository.updateStatus(companyId, isActive);
  }

  async updateCompanyRequest(
    companyId: string,
    isApproved: string,
    reason: string
  ) {
    const reqCompany = await this.companyRequestRepository.findById(companyId);
    if (!reqCompany?.email) return;
    const com = await this.userRepository.findByEmail(reqCompany?.email);
    if (!com) return;
    const company = await this.userRepository.updateRequest(
      com._id,
      isApproved
    );

    if (company && isApproved === 'Approved') {
      const tempCompany = await this.companyRequestRepository.findByEmail(
        company.email
      );
      if (!tempCompany) throw new Error('Temp company not found');

      const tenantId = generateCompanySlug(company.companyName);
      const tenantConnection = await connectTenantDB(tenantId);

      const trialPlan = await this.subscriptionRepository.findOne({
        planType: 'Trial',
      });
      if (!trialPlan) throw new Error('Trial plan not found');

      const startDate = new Date();
      const endDate = new Date(startDate);
      endDate.setMonth(endDate.getMonth() + trialPlan.durationInMonths);
      const newCompany = {
        companyName: tempCompany.companyName,
        email: tempCompany.email,
        phone: tempCompany.phone,
        industry: tempCompany.industry,
        businessRegNo: tempCompany.businessRegNo,
        city: tempCompany.city,
        state: tempCompany.state,
        country: tempCompany.country,
        zipcode: tempCompany.zipcode,
        subscriptionPlan: trialPlan._id.toString(),
        subscriptionStatus: 'Active' as 'Active',
        subscriptionStartDate: startDate,
        subscriptionEndDate: endDate,
      };
      await this.adminRepository.createCompany(newCompany);

      await this.companyRepository.createTenantCompany(
        newCompany,
        tenantConnection
      );
      await this.companyRequestRepository.delete(companyId);

      const subject =
        'Your Company Registration on WorkSphere Has Been Approved';
      const message = companyApprovalTemplates.approved(company.companyName);
      await sendEmail(company.email, subject, message);
    } else if (company && isApproved !== 'Approved') {
      const subject = 'Update on Your Company Registration Request';
      const message = companyApprovalTemplates.rejected(
        company.companyName,
        reason
      );
      await sendEmail(company.email, subject, message);
    }

    return company;
  }

  async getCompanyDetails(id: string) {
    try {
      const userInfo = await this.userRepository.findById(id);
      if (!userInfo || userInfo.role !== 'COMPANY') {
        return null;
      }
      const companyInfo = await this.companyRepository.findOne({
        email: userInfo.email,
      });
      
      if (companyInfo && companyInfo.subscriptionPlan) {
        const subscriptionPlanDetails = await this.subscriptionRepository.findById(
          companyInfo.subscriptionPlan
        );
        
        // Return company info with populated subscription plan
        return {
          ...companyInfo.toObject(),
          subscriptionPlan: subscriptionPlanDetails
        };
      }
      
      return companyInfo;
    } catch (error) {
      console.error('Error getting company details:', error);
      throw error;
    }
  }
}
