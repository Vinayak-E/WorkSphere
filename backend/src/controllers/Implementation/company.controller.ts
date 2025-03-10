import { Request, Response, NextFunction, RequestHandler } from 'express';
import { injectable, inject } from 'tsyringe';
import { ICompanyDocument } from '../../interfaces/company/company.types';
import { CompanyService } from '../../services/Implementation/company.service';

@injectable()
export class CompanyController {
  constructor(
    @inject('CompanyService') private readonly companyService: CompanyService
  ) {}

  // Endpoint for updating the company profile
  updateProfile = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const tenantConnection = req.tenantConnection;
      if (!tenantConnection) {
         res.status(500).json({ success: false, message: 'Tenant connection not established' });
         return;
      }
      const { id } = req.params;
      if (!id) {
        res.status(400).json({ success: false, message: 'Company ID is required' });
        return; 
      }
      const updateData: ICompanyDocument = req.body;
      const updatedCompany = await this.companyService.updateProfile(id, tenantConnection, updateData);
       res.status(200).json({
        success: true,
        message: 'Company updated successfully',
        data: updatedCompany
      });
      return; 
    } catch (error) {
      next(error);
    }
  };

  // Endpoint for retrieving a list of employees
  getEmployees = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const tenantConnection = req.tenantConnection;
      if (!tenantConnection) {
        res.status(500).json({ success: false, message: 'Tenant connection not established' });
        return;
      }
      const employees = await this.companyService.getEmployees(tenantConnection);
     res.status(200).json({ success: true, data: employees });
     return;
    } catch (error) {
      next(error);
    }
  };

  // Endpoint for adding a new employee
  addEmployee  = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const tenantConnection = req.tenantConnection;
      const tenantId = req.tenantId;
      if (!tenantConnection || !tenantId) {
        res.status(500).json({ success: false, message: 'Tenant connection not established' });
        return;
      }
      const employeeData = req.body;
      const newEmployee = await this.companyService.addEmployee(employeeData, tenantConnection, tenantId);
         res.status(201).json({
        success: true,
        message: 'Employee created successfully',
        data: newEmployee
      });
      return;
    } catch (error) {
      next(error);
    }
  };

  // Endpoint for updating an employee
  updateEmployee = async (req: Request, res: Response, next: NextFunction) => {
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
      const updatedEmployee = await this.companyService.updateEmployee(id, updateData, tenantConnection);
        res.status(200).json({
        success: true,
        message: 'Employee updated successfully',
        data: updatedEmployee
      });
      return;
    } catch (error) {
      next(error);
    }
  };
}
