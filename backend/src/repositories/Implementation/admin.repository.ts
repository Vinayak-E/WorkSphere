import {  Connection } from 'mongoose';
import { injectable, inject } from 'tsyringe';
import BaseRepository from '../baseRepository';
import { CompanySchema } from '../../models/companyModel';
import { IAdminRepository } from '../Interface/IAdminRepository';
import { ICompanyDocument} from '../../interfaces/company/company.types';

@injectable()
export class AdminRepository extends BaseRepository<ICompanyDocument> implements IAdminRepository {
 
  constructor(@inject('MainConnection') mainConnection: Connection) {
    super('Company', CompanySchema,mainConnection);
  }
  
  async createCompany(
    companyData: Partial<ICompanyDocument>,
  ): Promise<ICompanyDocument> {
    return await this.create(companyData)  
  }
}
