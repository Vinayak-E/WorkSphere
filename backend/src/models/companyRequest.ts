import mongoose, { Schema } from "mongoose";
import { ICompanyRequest } from "../interfaces/company/company.types";


const companyRequestSchema = new Schema<ICompanyRequest>({
    email: { type: String, unique: true },
    companyName: { type: String },
    phone: { type: String },
    industry:{type: String},
    businessRegNo:{type: String},
    city: { type: String, required: true, trim: true },
    state: { type: String, required: true, trim: true },
    country: { type: String, required: true, trim: true },
    zipcode: { type: String, required: true, },
    createdAt: { type: Date, default: Date.now },
  });
  
  const CompanyRequest = mongoose.model<ICompanyRequest>("CompanyRequest", companyRequestSchema);
 export default CompanyRequest;
