import { injectable, inject } from 'tsyringe';
import { Model, Connection } from 'mongoose';
import { IUser } from '../../interfaces/IUser.types';
import { UserModel } from '../../models/userModel';

import CompanyRequest from '../../models/companyRequest';
import { ICompanyDocument, ICompanyRequest } from '../../interfaces/company/company.types';
import BaseRepository from '../baseRepository';
import Company, { CompanySchema } from '../../models/companyModel';

@injectable()
export class AdminRepository   extends BaseRepository<ICompanyDocument> {
 
  constructor(@inject('MainConnection') mainConnection: Connection) {
    super('Company', CompanySchema,mainConnection);
  }

 

  async createCompany(
    companyData: ICompanyDocument,
  ): Promise<ICompanyDocument> {


    const company = {
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
    };
    return await this.create(company)  
  }
}
