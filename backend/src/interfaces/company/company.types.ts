import { ObjectId } from 'mongoose';
import { IUser } from '../IUser.types';
import { refreshToken } from 'firebase-admin/app';
import { IPayload } from '../IJwtService.types';

export interface ISignup {
  companyName: string;
  email: string;
  password: string;
  phone: string | null;
  industry: string;
  businessRegNo: string;
  city: string;
  state: string;
  country: string;
  zipcode: string;
}
export interface ICompanySignup {
  companyName: string | null;
  email: string;
  password: string;
  phone: string | null;
}

export interface ICreateCompany {
  companyName: string | null;
  phone: string | null;
  email: string;
}
export interface IGoogleSignup {
  email: string;
  googleId: string;
}

export interface ICompanyDocument extends Document {
  _id: string;
  companyName: string;
  email: string;
  password: string;
  phone: string;
  businessRegNo: string;
  industry?: string;
  city: string;
  state: string;
  country: string;
  zipcode: string;

  isActive?: boolean;

  role: string;

  logo?: string;
  subscriptionPlan?: string;
  subscriptionStatus?: 'active' | 'inactive' | 'expired';
  subscriptionExpiry?: Date;
  lastLogin?: Date;
  refreshToken?: string;
  passwordResetToken?: string;
  passwordResetExpires?: Date;
  createdAt: Date;
  updatedAt: Date;

  comparePassword(candidatePassword: string): Promise<boolean>;
  hasValidSubscription(): boolean;
}

export interface IVerifyOtpDto {
  email: string;
  otp: string;
}

export interface ICompanyUser {
  _id?: string;
  email: string;
  role: string;
}

export interface DecodedToken {
  email: string;
  role: string;
  tenantId: string;
}

export interface ICompanyRequest extends Document {
  _id: string;
  companyName: string;
  email: string;
  password: string;
  phone: string;
  city: string;
  state: string;
  country: string;
  zipcode: string;
  industry: string;
  businessRegNo: string;

  isActive?: boolean;

  role: string;

  logo?: string;
  subscriptionPlan?: string;
  subscriptionStatus?: 'active' | 'inactive' | 'expired';
  subscriptionExpiry?: Date;
  lastLogin?: Date;
  refreshToken?: string;
  passwordResetToken?: string;
  passwordResetExpires?: Date;
  createdAt: Date;
  updatedAt: Date;

  comparePassword(candidatePassword: string): Promise<boolean>;
  hasValidSubscription(): boolean;
}

export interface IAuthService {
  signup(
    data: ICompanySignup
  ): Promise<string | boolean | null | { message: string }>;
  verifyOtp(data: IVerifyOtpDto): Promise<boolean>;
  verifyLogin(
    email: string,
    password: string,
    userType: string
  ): Promise<{
    user: ICompanyUser;
    refreshToken: string;
    accessToken: string;
    tenantId: string;
    forcePasswordChange?: boolean;
  } | null>;
  resendOtp(email: string): Promise<boolean>;
  verifyAccessToken(token: string): Promise<DecodedToken | null>;
  refreshTokens(refreshToken: string): Promise<{
    accessToken: string;
    decodedToken: IPayload;
  }>;
  sendResetLink(email: string): Promise<boolean | null>;
  resetPassword(email: string, password: string): Promise<void>;
  findOrCreateCompany(profile: any): Promise<any>;
}

export interface ICompanyRepository {
  findByEmail(email: string): Promise<ICompanyDocument | null>;
  storeResetToken(email: string, resetToken: string, tokenExpiry: Date): any;
  createTenantCompany(
    tenantId: string,
    companyData: ICreateCompany
  ): Promise<ICompanyDocument | null>;
  createTempCompany(parsedData: ICompanyRequest): Promise<ICompanyRequest>;
}

export interface IOtpRepository {
  storeOtp(email: string, otp: string): Promise<void>;
  verifyOtp(email: string, otp: string): Promise<boolean>;
}
