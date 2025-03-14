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
    type: mongoose.Schema.Types.ObjectId,
    ref: 'SubscriptionPlan', 
  
  },
  subscriptionStatus: {
    type: String,
    enum: ['Active', 'Inactive', 'Expired'],
    default: 'Inactive',
  },
  subscriptionStartDate: {
    type: Date,
  },
  subscriptionEndDate: {
    type: Date,
  },
} , { timestamps: true });

CompanySchema.virtual('name').get(function () {
  return this.companyName;
});

const Company = mongoose.model<ICompanyDocument>('Company', CompanySchema);
export default Company;
