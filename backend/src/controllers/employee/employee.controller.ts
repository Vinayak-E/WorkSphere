import { Request, Response, NextFunction, RequestHandler } from "express";
import { IAuthService } from "../../interfaces/company/company.types";
import { IEmployeeService, IUpdateEmployee } from "../../interfaces/company/IEmployee.types";

export class EmployeeController {
  constructor(private readonly authService: IAuthService,
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
      await this.authService.resetPassword(email, newPassword);
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
      
      if (!req.user?.email) {
         res.status(401).json({
          success: false,
          message: "User email not found in token"
        });
        return
      }

      if (!req.tenantConnection) {
         res.status(500).json({
          success: false,
          message: "Tenant connection not established"
        });
        return
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
      next(error);
    }
  };





  updateProfile: RequestHandler = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const tenantConnection = req.tenantConnection;
      
      if (!tenantConnection) {
    res.status(500).json({ 
          success: false,
          message: "Tenant connection not established" 
        });
        return
      }

      const { id } = req.params;
    
      console.log('reqId at updateemploye',req.params)
      console.log('req.body at updateemploye',req.body)

      if (!id) {
         res.status(400).json({
        success: false,
        message: "Employee ID is required"
      });
      return
    }

    const updateData: IUpdateEmployee = req.body;

      const updatedEmployee= await this.employeeService.updateProfile(
        id,
        tenantConnection,
        updateData,
      );

        res.status(200).json({
        success: true,
        message: "Employee updated successfully",
        data: updatedEmployee
      });
 
    } catch (error) {
      next(error);
    }
  };

  checkIn: RequestHandler = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { employeeId} = req.body;
        const tenantConnection = req.tenantConnection;

        if (!tenantConnection) {
            res.status(500).json({
                success: false,
                message: "Tenant connection not established"
            });
            return;
        }

        if (!employeeId ) {
            res.status(400).json({
                success: false,
                message: "Employee ID and Company ID are required"
            });
            return;
        }

        const attendance = await this.employeeService.checkIn(
            tenantConnection,
            employeeId
        );

        res.status(200).json({
            success: true,
            message: "Checked in successfully",
            data: attendance
        });
    } catch (error) {
       
            next(error);
        
    }
};
}
