import mongoose, { Schema } from 'mongoose';
import { IAddress, ICompanyDocument } from '../interfaces/company/company.types';

const addressSchema = new Schema<IAddress>(
  {
    street: { type: String, required: true, trim: true },
    city: { type: String, required: true, trim: true },
    state: { type: String, required: true, trim: true },
    country: { type: String, required: true, trim: true },
    zipCode: { type: String, required: true, match: [/^\d{5}(-\d{4})?$/, 'Invalid ZIP code'] },
  },
  { _id: false }
);

const companySchema = new Schema<ICompanyDocument>(
  {
    companyName: {
      type: String,
      trim: true,
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
    },
    password: {
      type: String,
    },
    phone: {
      type: String,
   },
    address: {
      type: addressSchema,
      required: false,
    },
    isActive: { type: Boolean, default: true },
    logo: {
      type: String,
      default :false,
      required: false,
 
    },
    industry: {
      type: String,
      required:false,
      enum: [
        'Technology',
        'Healthcare',
        'Finance',
        'Manufacturing',
        'Retail',
        'Education',
        'Other',
      ],
    },
   
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
  },

);

companySchema.index({ email: 1 }, { unique: true });
companySchema.index({ companyName: 'text', description: 'text' });





const Company = mongoose.model<ICompanyDocument>('Company', companySchema);
export default Company;