import { ICompanyRequest } from '../../interfaces/company/company.types';

export interface ICompanyRequestRepository {
  createTempCompany(data: Partial<ICompanyRequest>): Promise<ICompanyRequest>;
  findByEmail(email: string): Promise<ICompanyRequest | null>;
  find(): Promise<ICompanyRequest[] | null>;
  findById(companId: string): Promise<ICompanyRequest | null>;
  delete(companyId: string): Promise<ICompanyRequest | null>;
}
