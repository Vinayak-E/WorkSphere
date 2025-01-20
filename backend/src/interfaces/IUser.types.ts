import { FlattenMaps, ObjectId } from "mongoose";
import { Document } from "mongoose";
import { ICompanyDocument } from "./company/company.types";

export interface IUser extends Document {
  _id :string 
  companyName: string;
  email: string;
  password: string;
  phone: string;
  role:string;
  isActive: boolean;
  isApproved: string;
  createdAt: Date;
  updatedAt: Date;
}


export interface IUserRepository{

  findByEmailOrCompanyName(email: string,companyName:string): Promise<IUser | null>;
  createUser(user: Partial<IUser>, options?: any): Promise<IUser>;
  findByEmail(email:string): Promise<IUser | null>;
  resetPassword(email: string, password: string): Promise<void>
}