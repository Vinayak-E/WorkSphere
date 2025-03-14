import { Document, PopulateOptions } from 'mongoose';

export interface IUser extends Document {
  _id: string;
  companyName: string;
  email: string;
  password: string;
  phone: string;
  role: string;
  isActive: boolean;
  isApproved: string;
  resetToken :string;
  resetTokenExpiry :Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface IUserRepository {
  findByEmailOrCompanyName(
    email: string,
    companyName: string
  ): Promise<IUser | null>;
  createUser(user: Partial<IUser>, options?: any): Promise<IUser>;
  findByEmail(email: string): Promise<IUser | null>;
  resetPassword(email: string, password: string): Promise<void>;
}

export interface IBaseRepository<T extends Document> {
  create(data: Partial<T>): Promise<T>;
  findById(id: string): Promise<T | null>;
  findAll(query?: Record<string, any>): Promise<T[]>;
  findOne(query: Record<string, any>): Promise<T | null>;
  update(id: string, data: Partial<T>): Promise<T | null>;
  delete(id: string): Promise<T | null>;
  findByIdAndPopulate(
    id: string,
    populateFields: (string | PopulateOptions)[]
  ): Promise<T | null>;
}
