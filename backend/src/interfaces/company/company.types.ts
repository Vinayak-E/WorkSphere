import { ObjectId } from "mongoose";
import { IUser } from "../IUser.types";
import { refreshToken } from "firebase-admin/app";

export interface IAddress {
  street: string;
  city: string;
  state: string;
  country: string;
  zipCode: string;
}

export interface ICompanySignup {
  companyName: string | null;
  email: string;
  password: string ;
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
  address?: IAddress;
  isActive?: boolean;
 
  role:string
 
  logo?: string;
  industry?: string;
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

export interface ICompanyService {
 signup(data: ICompanySignup): Promise<string | boolean | null | { message: string }>
  verifyOtp(data: IVerifyOtpDto): Promise<boolean>; 
  verifyLogin(email: string, password: string,userType:string): Promise<{ user: ICompanyUser,refreshToken:string,accessToken:string, tenantId: string ,forcePasswordChange?: boolean} | null> 
  resendOtp(email: string): Promise<boolean>
  generateOtp(email: string): Promise<any>
  verifyAccessToken(token: string): Promise<DecodedToken | null>
  generateAccessToken(userId: string): Promise<string>
  sendResetLink(email: string): Promise<boolean | null>
  resetPassword(email: string, password: string): Promise<void>
  findOrCreateCompany(profile: any): Promise<any>

}

export interface ICompanyRepository {
  findByEmail(email: string): Promise<ICompanyDocument| null>;
  storeResetToken(email: string, resetToken: string, tokenExpiry: Date):any
  createTenantCompany(tenantId:string,companyData:ICreateCompany) :Promise<ICompanyDocument |null>;
}

export interface IOtpRepository {
  storeOtp(email: string, otp: string): Promise<void>;
  verifyOtp(email: string, otp: string): Promise<boolean>; 
}
