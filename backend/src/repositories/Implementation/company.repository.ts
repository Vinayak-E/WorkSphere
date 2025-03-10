import { inject, injectable } from 'tsyringe';
import { Connection } from 'mongoose';
import { ICompanyDocument, ICompanyRepository } from '../../interfaces/company/company.types';
import Company from '../../models/companyModel';
import CompanyRequest from '../../models/companyRequest';
import BaseRepository from '../baseRepository';

@injectable()
export class CompanyRepository extends BaseRepository<ICompanyDocument>  {
  private mainConnection: Connection;
  private companyModel: ReturnType<typeof this.getModel>;

  constructor(@inject('MainConnection') mainConnection: Connection) {
    super('Company', Company.schema, mainConnection);
    this.mainConnection = mainConnection;
    this.companyModel = this.getModel(); 
  }

 

  async findByCompanyName(companyName: string): Promise<ICompanyDocument | null> {

    return await this.findOne({ companyName });
  }

  async findByEmail(email: string): Promise<ICompanyDocument | null> {
    return await this.findOne({ email });
  }


  async createTempCompany(userData: Partial<ICompanyDocument>): Promise<ICompanyDocument> {
    const tempCompany = new CompanyRequest(userData);
    return await tempCompany.save();
  }

  async createTenantCompany(
    tenantId: string,
    companyData: ICompanyDocument,
    tenantConnection: Connection
  ): Promise<ICompanyDocument> {
   
    const TenantCompanyModel =
      tenantConnection.models.Company ||
      tenantConnection.model<ICompanyDocument>('Company', Company.schema);

    const company = new TenantCompanyModel({
      companyName: companyData.companyName,
      email: companyData.email,
      phone: companyData.phone,
      industry: companyData.industry,
      businessRegNo: companyData.businessRegNo,
      city: companyData.city,
      state: companyData.state,
      country: companyData.country,
      zipcode: companyData.zipcode,
      isVerified: true,
    });
    return await company.save();
  }

  async storeResetToken(email: string, resetToken: string, tokenExpiry: Date): Promise<void> {
    await this.companyModel.updateOne({ email }, { resetToken, resetTokenExpiry: tokenExpiry }).exec();
  }

  async getCompanyByEmail(
    email: string,
    tenantConnection: Connection
  ): Promise<ICompanyDocument | null> {
    const TenantCompanyModel =
      tenantConnection.models.Company ||
      tenantConnection.model<ICompanyDocument>('Company', Company.schema);
    return await TenantCompanyModel.findOne({ email }).exec();
  }


  async update(
    id: string,
    updateData: Partial<ICompanyDocument>,
    tenantConnection: Connection
  ): Promise<ICompanyDocument | null> {
    const TenantCompanyModel =
      tenantConnection.models.Company ||
      tenantConnection.model<ICompanyDocument>('Company', Company.schema);
    return await TenantCompanyModel.findByIdAndUpdate(
      id,
      { $set: updateData },
      { new: true, runValidators: true }
    ).exec();
  }
}


