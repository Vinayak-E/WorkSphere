import { IUser } from "../../interfaces/IUser.types"; 
import { Model } from "mongoose";
import { UserModel } from "../../models/userModel";
import { IAdminRepository } from "../../interfaces/admin/admin.types";
import Company from "../../models/companyModel";

interface CompanyFilter {
  status?: string;
}
export class AdminRepository implements IAdminRepository {
  private readonly model: Model<IUser>; 
  constructor() {
    this.model = UserModel;
  }

  async findByEmail(email: string): Promise<IUser | null> {
      console.log('email',email)
    const data = await this.model.findOne({ email });
    console.log("data received at repository",data)
    if (!data) {
      return null;
    }
    return data;
  }

  async findCompanies(): Promise<any> {
    return await this.model.find({role:"COMPANY"})
  }


  async updateStatus(companyId: string, isActive: boolean) {
    const company = await this.model.findOneAndUpdate(
      { _id: companyId },
      { isActive },
      { new: true } 
    );
  
    return company; 
  }

  async updateRequest(companyId:string,isApproved :string){
    const company = await this.model.findOneAndUpdate(
      { _id: companyId },
      { isApproved},
      { new: true } 
    );
  
    return company; 

  }
  
  

}
