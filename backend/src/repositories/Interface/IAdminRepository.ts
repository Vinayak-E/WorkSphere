import { Connection } from 'mongoose';
import { ICompanyDocument } from '../../interfaces/company/company.types';

export interface IAdminRepository {
    
  createCompany(
    companyData: Partial<ICompanyDocument>
  ): Promise<ICompanyDocument>;
  update(
    id: string,
    data: Partial<ICompanyDocument>,
    tenantConnection?: Connection
  ): Promise<ICompanyDocument | null>;
  findOne(
    query: Partial<ICompanyDocument>,
    tenantConnection?: Connection
  ): Promise<ICompanyDocument | null>;
}
