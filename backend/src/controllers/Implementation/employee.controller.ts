import { injectable, inject } from 'tsyringe';
import { AuthService } from '../../services/Implementation/auth.service';
import { Request, Response, NextFunction, RequestHandler } from 'express';
import { EmployeeService } from '../../services/Implementation/employee.service';
import { HttpStatus } from '../../constants/httpStatus';
import { Messages } from '../../constants/messages';

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
         res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({ success: false, message:Messages.TENANT_CONNECTION_ERROR });
         return;
      }
      if (!req.user?.email) {
        res.status(HttpStatus.UNAUTHORIZED).json({
          success: false,
          message: Messages.USER_EMAIL_NOT_FOUND,
        });
        return;
      }
      const email = req.user.email
      const employee = await this.employeeService.getEmployeeProfile(tenantConnection, email);
      res.status(HttpStatus.OK).json({ success: true, data: employee });
    } catch (error) {
      next(error);
    }
  };

  updateProfile = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const tenantConnection = req.tenantConnection;
      if (!tenantConnection) {
        res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({ success: false, message:Messages.TENANT_CONNECTION_ERROR});
        return;
      }
      const { id } = req.params; 
      if (!id) {
        res.status(HttpStatus.BAD_REQUEST).json({ success: false, message: Messages.EMPLOYEE_ID_REQUIRED });
        return;
      }
      const updateData = req.body;
      const updatedEmployee = await this.employeeService.updateProfile(id, updateData, tenantConnection);
        res.status(HttpStatus.OK).json({
        success: true,
        message:Messages.EMPLOYEE_UPDATE_SUCCESS,
        data: updatedEmployee
      });
      return;
    } catch (error) {
      next(error);
    }
  };

  getDepartmentEmployees = async (req: Request, res: Response, next: NextFunction) => {
    try {
   
      const tenantConnection = req.tenantConnection;
      if (!tenantConnection) {
         res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({ success: false, message:Messages.TENANT_CONNECTION_ERROR});
         return;
      }
     
      const email = req.user?.email;
      if (!email) {
        res.status(HttpStatus.UNAUTHORIZED).json({
          success: false,
          message: Messages.USER_EMAIL_NOT_FOUND,
        });
        return;
      }
      const departmentEmployees = await this.employeeService.getDepartmentEmployees(tenantConnection, email);
       res.status(HttpStatus.OK).json({ success: true, data: departmentEmployees });
       return;
    } catch (error) {
      next(error);
    }
  };
  
  changePassword: RequestHandler = async (req, res, next) => {
    const { email, newPassword } = req.body;
    try {
      await this.authService.resetPassword(email, newPassword);
      res.status(HttpStatus.OK).json({
        success: true,
        message: Messages.PASSWORD_CHANGE_SUCCESS,
      });
    } catch (error) {
      next(error);
    }
  };
}
