import { IUser } from "../../interfaces/IUser.types";

export interface IUserRepository {
    createUser(userData: Partial<IUser>): Promise<IUser>
    findByEmailOrCompanyName(email: string, companyName: string): Promise<IUser | null>
    findByEmail(email: string): Promise<IUser | null>
    resetPassword(email: string, password: string): Promise<void>
    updateRequest(companyId: string, isApproved: string): Promise<IUser | null>
    updateStatus(companyId: string, isActive: boolean): Promise<IUser | null>
    storeResetToken(email: string, resetToken: string, resetTokenExpiry: Date): Promise<void>
    findAll(query: Record<string, any>): Promise<IUser[]>; 
    findById(id: string): Promise<IUser | null>
}