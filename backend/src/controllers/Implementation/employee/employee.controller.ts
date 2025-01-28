import { Request, Response, NextFunction, RequestHandler } from "express";
import { ICompanyService } from "../../../interfaces/company/company.types";
import { IEmployeeService } from "../../Interface/IEmpoyee.types";

export class EmployeeController {
  constructor(private readonly companyService: ICompanyService,
    private readonly  employeeService :IEmployeeService) {}

  changePassword: RequestHandler = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    const { email, newPassword } = req.body;
    try {
      console.log("email at employee controller", email);
      console.log("req.body at employeecontroller", req.body);
      await this.companyService.resetPassword(email, newPassword);
      res.status(200).json({
        success: true,
        message: "Password Changed Successfully",
      });
    } catch (error) {
      next(error);
    }
  };

  getProfile: RequestHandler = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      // Since we're using the middleware, we can directly access req.user and req.tenantConnection
      if (!req.user?.email) {
         res.status(401).json({
          success: false,
          message: "User email not found in token"
        });
      }

      if (!req.tenantConnection) {
         res.status(500).json({
          success: false,
          message: "Tenant connection not established"
        });
      }

      const details = await this.employeeService.getEmployeeProfile(
        req.tenantConnection,
        req.user.email
      );
      
       res.status(200).json({
        success: true,
        data: details
      });
    } catch (error) {
      console.error("Error fetching employee profile:", error);
      next(error);
    }
  };
}
