import { RequestHandler } from 'express';
import { IAuthService } from '../../interfaces/company/company.types';
import {
  IEmployeeService,
  IUpdateEmployee,
} from '../../interfaces/company/IEmployee.types';

export class EmployeeController {
  constructor(
    private readonly authService: IAuthService,
    private readonly employeeService: IEmployeeService
  ) {}

  changePassword: RequestHandler = async (req, res, next) => {
    const { email, newPassword } = req.body;
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

  getProfile: RequestHandler = async (req, res, next) => {
    try {
      if (!req.user?.email) {
        res.status(401).json({
          success: false,
          message: 'User email not found in token',
        });
        return;
      }

      if (!req.tenantConnection) {
        res.status(500).json({
          success: false,
          message: 'Tenant connection not established',
        });
        return;
      }

      const details = await this.employeeService.getEmployeeProfile(
        req.tenantConnection,
        req.user.email
      );

      res.status(200).json({
        success: true,
        data: details,
      });
    } catch (error) {
      next(error);
    }
  };

  updateProfile: RequestHandler = async (req, res, next) => {
    try {
      const tenantConnection = req.tenantConnection;

      if (!tenantConnection) {
        res.status(500).json({
          success: false,
          message: 'Tenant connection not established',
        });
        return;
      }

      const { id } = req.params;

      if (!id) {
        res.status(400).json({
          success: false,
          message: 'Employee ID is required',
        });
        return;
      }

      const updateData: IUpdateEmployee = req.body;

      const updatedEmployee = await this.employeeService.updateProfile(
        id,
        tenantConnection,
        updateData
      );

      res.status(200).json({
        success: true,
        message: 'Employee updated successfully',
        data: updatedEmployee,
      });
    } catch (error) {
      next(error);
    }
  };

  

  


  getDepartmentEmployees: RequestHandler = async (req, res, next) => {
    try {
      const tenantConnection = req.tenantConnection;

      if (!tenantConnection) {
        res.status(500).json({
          success: false,
          message: 'Tenant connection not established',
        });
        return;
      }

      const userEmail = req.user?.email;
      if (!userEmail) {
        res.status(401).json({
          success: false,
          message: 'User not authenticated',
        });
        return;
      }

      const employees = await this.employeeService.getDepartmentEmployees(
        tenantConnection,
        userEmail
      );

      res.status(200).json({
        success: true,
        data: employees,
      });
    } catch (error) {
      next(error);
    }
  };
}
