import { Connection, Model } from "mongoose";
import { ICompanyDocument, ICompanyRepository ,ICompanySignup, ICreateCompany} from "../../interfaces/company/company.types";
import Company  from "../../models/companyModel";
import { UserModel } from "../../models/userModel";
import { IUser } from "../../interfaces/IUser.types";
import { connectTenantDB } from "../../configs/db.config";


export class CompanyRepository implements ICompanyRepository {
  private readonly model: Model<ICompanyDocument>;

  constructor() {
    this.model = Company;
  }
  async findByCompanyName(companyName: string): Promise<ICompanyDocument | null> {
    return await this.model.findOne({ companyName });
  }
  async createTenantCompany(tenantId: string, companyData: ICreateCompany) {
    try {
      const tenantDB: Connection = await connectTenantDB(tenantId);
      const TenantCompanyModel = tenantDB.model<ICompanyDocument>("Company", Company.schema);
      
      const company = new TenantCompanyModel({
        companyName: companyData.companyName,
        email: companyData.email,
        phone: companyData.phone,
        isVerified: true,
      });

      await company.save();
      return company;
    } catch (error) {
      console.error("Error creating tenant company:", error);
      return null;
    }
  }


  //////

  async findByEmail(email: string): Promise<ICompanyDocument | null> {
    return await this.model.findOne({ email });
  }
  
  async storeResetToken(email: string, resetToken: string, tokenExpiry: Date): Promise<void> {
    try {
        await this.model.updateOne(
            { email },
            { resetToken, resetTokenExpiry: tokenExpiry }
        );
    } catch (error) {
        console.error('Error storing the reset toekn:', error);
    }
}

  
}
