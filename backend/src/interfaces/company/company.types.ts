
import { Document } from 'mongoose';
import { IPayload } from '../IJwtService.types';
import mongoose from 'mongoose';
import { IProjectStats, ITaskStats } from './IProject.types';
import { IEmployeeStats } from './IEmployee.types';

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
  subscriptionPlan?: string;
  subscriptionStatus?: 'Active' | 'Inactive' | 'Expired';
  subscriptionStartDate?: Date;
  subscriptionEndDate?: Date;
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
  subscriptionPlan?: string;
  subscriptionStatus?: 'Active' | 'Inactive' | 'Expired';
  subscriptionStartDate?: Date;
  subscriptionEndDate?: Date;
  lastLogin?: Date;
  refreshToken?: string;
  passwordResetToken?: string;
  passwordResetExpires?: Date;
  createdAt: Date;
  updatedAt: Date;

  comparePassword(candidatePassword: string): Promise<boolean>;
  hasValidSubscription(): boolean;
}


export interface IDashboardData {
  projects: IProjectStats;
  tasks: ITaskStats;
  employees: IEmployeeStats;
}



