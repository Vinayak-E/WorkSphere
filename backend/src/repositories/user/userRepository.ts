import { Model } from "mongoose";
import { IUserRepository,IUser } from "../../interfaces/IUser.types";
import { UserModel } from "../../models/userModel";
import { ICompanyDocument } from "../../interfaces/company/company.types";

export class UserRepository implements IUserRepository{
    private readonly model: Model<IUser>; 
    constructor(){
        this.model = UserModel
    }
    async createUser(userData : Partial<IUser>) {
      const user = new this.model(userData);
      return await user.save();
  }

    async findByEmailOrCompanyName(email: string, companyName: string): Promise<IUser | null> {
      return await this.model.findOne({ 
        $or: [{ email }, { companyName }]
      });
    }

      async findByEmail(email : string) : Promise<IUser | null>{
        return await this.model.findOne({email});
      }

      
async resetPassword(email: string, password: string): Promise<void> {
  try {
      await this.model.updateOne(
          { email },
          { password }
      );
  } catch (error) {
      console.error('Error saving the new password!', error);
  }
}

    
    
    
}