import { injectable, inject } from 'tsyringe';
import { Connection } from 'mongoose';
import { ICompanyRequest } from '../../interfaces/company/company.types';
import CompanyRequest from '../../models/companyRequest';
import BaseRepository from '../baseRepository';

@injectable()
export class CompanyRequestRepository extends BaseRepository<ICompanyRequest> {
  constructor(@inject('MainConnection') mainConnection: Connection) {
    super('CompanyRequest', CompanyRequest.schema, mainConnection);
  }

  async createTempCompany(data: Partial<ICompanyRequest>): Promise<ICompanyRequest> {
    return await this.create(data);
  }

  async findByEmail(email: string): Promise<ICompanyRequest | null> {
    return await this.findOne({ email });
  }
  async find(): Promise<ICompanyRequest[] | null> {
    return await this.findAll();
  }


}