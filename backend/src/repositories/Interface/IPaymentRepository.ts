import { IPaymentHistory } from "../../interfaces/IPayment.types";


export interface IPaymentRepository {
    getPaymentsByCompanyId(companyId: string, page?: number, limit?: number): Promise<{
        payments: IPaymentHistory[];
        total: number;
    }>
    getPaymentsByTenantId(tenantId: string): Promise<IPaymentHistory[]>
    getRecentPayments(page?: number, limit?: number): Promise<{
        payments: IPaymentHistory[];
        total: number;
    }>
    getTotalRevenue(): Promise<number>
    getMonthlyRevenue(year: number, month: number): Promise<number>
    create(data: Partial<IPaymentHistory>): Promise<IPaymentHistory>
    findAll(query: Record<string, any>): Promise<IPaymentHistory[]>; 
}