import { inject, injectable } from 'tsyringe';
import { Connection } from 'mongoose';
import { ICompanyDocument } from '../../interfaces/company/company.types';
import Company from '../../models/companyModel';
import BaseRepository from '../baseRepository';

@injectable()
export class CompanyRepository extends BaseRepository<ICompanyDocument> {
  constructor(@inject('MainConnection') mainConnection: Connection) {
    super('Company', Company.schema, mainConnection);
  }

  async findByCompanyName(companyName: string, connection: Connection): Promise<ICompanyDocument | null> {
    return await this.findOne({ companyName }, connection);
  }

  async findByEmail(email: string, connection: Connection): Promise<ICompanyDocument | null> {
    return await this.findOne({ email }, connection);
  }

  async createTenantCompany(
    companyData: Partial<ICompanyDocument>,
    connection: Connection
  ): Promise<ICompanyDocument> {
    return await this.create(companyData, connection);
  }


}