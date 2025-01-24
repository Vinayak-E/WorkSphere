import { Request, Response, NextFunction, RequestHandler } from "express";
import { ICompanyService } from "../../../interfaces/company/company.types";

export class EmployeeController {
  constructor(private readonly companyService: ICompanyService) {}

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
}
