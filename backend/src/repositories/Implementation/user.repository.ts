import { Connection } from 'mongoose';
import {  IUser } from '../../interfaces/IUser.types';
import { UserSchema } from '../../models/userModel';
import BaseRepository from '../baseRepository';
import { inject, injectable } from 'tsyringe';
import { IUserRepository } from '../Interface/IUserRepository';
@injectable()
export class UserRepository  extends BaseRepository<IUser>  implements IUserRepository{
    constructor(@inject('MainConnection') mainDbConnection: Connection) {
        super('User', UserSchema, mainDbConnection);
      }
  async createUser(userData: Partial<IUser>) {        
    return await  this.create(userData);
  }

  async findByEmailOrCompanyName(email: string, companyName: string): Promise<IUser | null> {
    return await this.findOne({ $or: [{ email }, { companyName }] });
  }

  async findByEmail(email: string): Promise<IUser | null> {
    return await this.findOne({ email });
  }
async resetPassword(email: string, password: string): Promise<void> {
  try {
    await this.findOneAndUpdate({ email }, { password }, { new: true })
  } catch (error) {
    console.error('Error updating the password!', error);
    throw new Error('Failed to reset password');
  }
}

  async updateRequest(companyId: string, isApproved: string) {
    return await this.findOneAndUpdate(
      { _id: companyId },
      { isApproved },
      { new: true }
    );
  }
  async updateStatus(companyId: string, isActive: boolean) {
    return await this.findOneAndUpdate(
      { email: companyId },
      { isActive },
      { new: true }
    );
  }
  async storeResetToken(
    email: string,
    resetToken: string,
    resetTokenExpiry: Date,
  ): Promise<void> {
    await this.findOneAndUpdate({email} ,{ resetToken, resetTokenExpiry });
  }
}
