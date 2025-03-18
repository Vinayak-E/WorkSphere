import { IUser } from '../IUser.types';

export interface IAdminLoginData {
  email: string;
  password: string;
}

export interface IAdminService {
  verifyAdmin(
    email: string,
    password: string
  ): Promise<{ accessToken: string; refreshToken: string } | null>;
  getCompanies(): Promise<any>;
  updateCompanyStatus(
    companyId: string,
    isActive: boolean
  ): Promise<IUser | null>;
  updateCompanyRequest(
    companyId: string,
    isApproved: string,
    reason: string
  ): Promise<IUser | null>;
  getProfile(email: string): Promise<IUser | null>;
}


