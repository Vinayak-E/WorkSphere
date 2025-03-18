import { Connection } from 'mongoose';
import { injectable, inject } from 'tsyringe';
import BaseRepository from '../baseRepository';
import CompanyRequest from '../../models/companyRequest';
import { ICompanyRequest } from '../../interfaces/company/company.types';
import { ICompanyRequestRepository } from '../Interface/ICompanyRequestRepository';

@injectable()
export class CompanyRequestRepository extends BaseRepository<ICompanyRequest> implements ICompanyRequestRepository{
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