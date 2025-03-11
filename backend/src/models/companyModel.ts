import mongoose, { Schema } from 'mongoose';
import { ICompanyDocument } from '../interfaces/company/company.types';

export const CompanySchema = new Schema<ICompanyDocument>({
  companyName: { type: String },
  email: { type: String, unique: true },
  password: { type: String },
  phone: { type: String },
  isActive: { type: Boolean, default: true },
  industry: { type: String },
  businessRegNo: { type: String },
  city: { type: String },
  state: { type: String },
  country: { type: String },
  zipcode: { type: String },

  subscriptionPlan: {
    type: String,
    enum: ['free', 'basic', 'premium', 'enterprise'],
    default: 'free',
  },
  subscriptionStatus: {
    type: String,
    enum: ['active', 'inactive', 'expired'],
    default: 'inactive',
  },
  subscriptionExpiry: { type: Date },
  lastLogin: { type: Date },
  refreshToken: { type: String, select: false },
  passwordResetToken: { type: String, select: false },
  passwordResetExpires: { type: Date, select: false },
});

CompanySchema.virtual('name').get(function () {
  return this.companyName;
});

const Company = mongoose.model<ICompanyDocument>('Company', CompanySchema);
export default Company;
