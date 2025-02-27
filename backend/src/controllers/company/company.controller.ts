import { NextFunction, Request, RequestHandler, Response } from 'express';
import { CompanyService } from '../../services/company/company.service';
import { ICompanyDocument } from '../../interfaces/company/company.types';

export class CompanyController {
  constructor(private readonly companyService: CompanyService) {}

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

      const updateData: ICompanyDocument = req.body;
      const updatedEmployee = await this.companyService.updateProfile(
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
}
