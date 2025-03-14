import { injectable, inject } from 'tsyringe';
import {  Connection } from 'mongoose';

import { ICompanyDocument} from '../../interfaces/company/company.types';
import BaseRepository from '../baseRepository';
import { CompanySchema } from '../../models/companyModel';

@injectable()
export class AdminRepository   extends BaseRepository<ICompanyDocument> {
 
  constructor(@inject('MainConnection') mainConnection: Connection) {
    super('Company', CompanySchema,mainConnection);
  }
  
  async createCompany(
    companyData: Partial<ICompanyDocument>,
  ): Promise<ICompanyDocument> {
    return await this.create(companyData)  
  }
}
