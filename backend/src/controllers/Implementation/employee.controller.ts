import { Request, Response, NextFunction, RequestHandler } from 'express';
import { injectable, inject } from 'tsyringe';
import { EmployeeService } from '../../services/Implementation/employee.service';
import { AuthService } from '../../services/Implementation/auth.service';

@injectable()
export class EmployeeController {
  constructor(
    @inject('EmployeeService') private readonly employeeService: EmployeeService,
    @inject('AuthService') private readonly authService: AuthService
  ) {}


  getProfile = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const tenantConnection = req.tenantConnection;
      if (!tenantConnection) {
         res.status(500).json({ success: false, message: 'Tenant connection not established' });
         return;
      }
      if (!req.user?.email) {
        res.status(401).json({
          success: false,
          message: 'User email not found in token',
        });
        return;
      }
      const email = req.user.email
      const employee = await this.employeeService.getEmployeeProfile(tenantConnection, email);
      res.status(200).json({ success: true, data: employee });
    } catch (error) {
      next(error);
    }
  };

  updateProfile = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const tenantConnection = req.tenantConnection;
      if (!tenantConnection) {
        res.status(500).json({ success: false, message: 'Tenant connection not established' });
        return;
      }
      const { id } = req.params; 
      if (!id) {
        res.status(400).json({ success: false, message: 'Employee ID is required' });
        return;
      }
      const updateData = req.body;
      const updatedEmployee = await this.employeeService.updateProfile(id, updateData, tenantConnection);
        res.status(200).json({
        success: true,
        message: 'Employee profile updated successfully',
        data: updatedEmployee
      });
      return;
    } catch (error) {
      next(error);
    }
  };

  getDepartmentEmployees = async (req: Request, res: Response, next: NextFunction) => {
    try {
        console.log
      const tenantConnection = req.tenantConnection;
      if (!tenantConnection) {
         res.status(500).json({ success: false, message: 'Tenant connection not established' });
         return;
      }
     
      const email = req.user?.email;
      if (!email) {
        res.status(401).json({
          success: false,
          message: 'User not authenticated',
        });
        return;
      }
      const departmentEmployees = await this.employeeService.getDepartmentEmployees(tenantConnection, email);
      console.log('department employees',departmentEmployees)
       res.status(200).json({ success: true, data: departmentEmployees });
       return;
    } catch (error) {
      next(error);
    }
  };
  
  changePassword: RequestHandler = async (req, res, next) => {
    const { email, newPassword } = req.body;
    console.log("dd",email,newPassword)
    try {
      await this.authService.resetPassword(email, newPassword);
      res.status(200).json({
        success: true,
        message: 'Password Changed Successfully',
      });
    } catch (error) {
      next(error);
    }
  };
}
