import { Connection } from 'mongoose';
import { ICompanyDocument } from '../../interfaces/company/company.types';

export interface ICompanyRepository {
  findByCompanyName(
    companyName: string,
    connection: Connection
  ): Promise<ICompanyDocument | null>;
  findByEmail(
    email: string,
    connection: Connection
  ): Promise<ICompanyDocument | null>;
  createTenantCompany(
    companyData: Partial<ICompanyDocument>,
    connection: Connection
  ): Promise<ICompanyDocument>;
  findOne(
    query: Partial<ICompanyDocument>,
    tenantConnection?: Connection
  ): Promise<ICompanyDocument | null>;
  update(
    companyId: string,
    data: Partial<ICompanyDocument>,
    tenantConnection?: Connection
  ): Promise<ICompanyDocument | null>;
  findById(
    companId: string,
    tenantConnection: Connection
  ): Promise<ICompanyDocument | null>;
}
