import { Connection, Model } from "mongoose";
import { ICompanyDocument, ICompanyRepository ,ICompanySignup, ICreateCompany} from "../../interfaces/company/company.types";
import Company  from "../../models/companyModel";
import { UserModel } from "../../models/userModel";
import { IUser } from "../../interfaces/IUser.types";
import { connectTenantDB } from "../../configs/db.config";
import CompanyRequest from "../../models/companyRequest";
import { ILeave } from "../../interfaces/company/IAttendance.types";
import Leave from "../../models/leavesModel";
import { IEmployee } from "../../interfaces/company/IEmployee.types";
import Employee from "../../models/employeeModel";

export class CompanyRepository implements ICompanyRepository {
  private readonly model: Model<ICompanyDocument>;

  constructor() {
    this.model = Company;
  }

  private getCompanyModel(connection: Connection): Model<ICompanyDocument> {
    return connection.models.Company || connection.model<ICompanyDocument>("Company", Company.schema);
}
private getEmployeeModel(connection: Connection): Model<IEmployee> {
  return connection.models.Employee || connection.model<IEmployee>("Employee", Employee.schema);
}


private getLeaveModel(connection: Connection): Model<ILeave> {
  return connection.models.Leave || connection.model<ILeave>("Leave", Leave.schema);
}


  async findByCompanyName(companyName: string): Promise<ICompanyDocument | null> {
    return await this.model.findOne({ companyName });
  }


  async createTenantCompany(tenantId: string, companyData: ICompanyDocument) {
    try {
      const tenantDB: Connection = await connectTenantDB(tenantId);
      const TenantCompanyModel = tenantDB.model<ICompanyDocument>("Company", Company.schema);
      
      const company = new TenantCompanyModel({
        companyName: companyData.companyName,
        email: companyData.email,
        phone: companyData.phone,
        industry: companyData.industry,
        businessRegNo: companyData.businessRegNo,
        city:companyData.city,
        state: companyData.state,
        country:companyData.country,
        zipcode:companyData.zipcode,
        
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

  async findById(id: string,connection:Connection): Promise<IEmployee | null> {
    const EmployeeModel = this.getEmployeeModel(connection);
    return await EmployeeModel .findOne({ id })
    
  }

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

async createTempCompany(userData : Partial<IUser>) {
  const user = new CompanyRequest(userData);
  return await user.save();
}

async getCompanyByEmail( email: string,connection: Connection,): Promise<ICompanyDocument | null> {
  try {
    const CompanyModel = this.getCompanyModel(connection);
      return await CompanyModel .findOne({ email })
      
  } catch (error) {
      throw error;
  }
}


async getLeaveRequests(
  connection: Connection,
  page: number,
  limit: number,
  startDate?: string,
  endDate?: string,
  status?: string
): Promise<{ leaves: ILeave[]; total: number }> {
  const skip = (page - 1) * limit;
  
  let query: any = { status: "Pending"};
  
  if (startDate && endDate) {
    query.startDate = { $gte: new Date(startDate) };
    query.endDate = { $lte: new Date(endDate) };
  }

  if (status) {
    query.status = status;
  }

  const LeaveModel = this.getLeaveModel(connection);
  const EmployeeModel = this.getEmployeeModel(connection);

  const [leaves, total] = await Promise.all([
    LeaveModel.find(query)
      .populate("employeeId")
      .sort([
        ["appliedAt", -1]
      ])
      .skip(skip)
      .limit(limit)
      .lean(),
    LeaveModel.countDocuments(query),
  ]);

  return { leaves, total };
}




async updateLeaveStatus(
  leaveId: string,
  status: string,
  connection: Connection
): Promise<ILeave | null> {
  try {
    const LeaveModel = this.getLeaveModel(connection);
    const EmployeeModel = this.getEmployeeModel(connection)
    const updatedLeave = await LeaveModel.findByIdAndUpdate(
      leaveId,
      { 
        status,
        updatedAt: new Date()
      },
      { new: true }
    ).populate('employeeId');

    return updatedLeave;
  } catch (error) {
    throw error;
  }
}

  
}
