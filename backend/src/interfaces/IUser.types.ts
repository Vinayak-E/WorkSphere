import { Document } from "mongoose";


export interface IUser extends Document {
  _id :string 
  companyName: string;
  email: string;
  password: string;
  phone: string;
  role:string;
  industry:string;
  businessRegNo: string;
  city:string;
  state:string;
  country:string;
  zipcode:string;
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