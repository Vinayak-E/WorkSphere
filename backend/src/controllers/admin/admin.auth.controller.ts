import { IAdminService } from '../../interfaces/admin/admin.types';
import { RequestHandler } from 'express-serve-static-core';

export class AdminAuthController {
  constructor(private readonly adminService: IAdminService) {}

  adminLogin: RequestHandler = async (req, res, next) => {
    try {
      const { inputEmail: email, inputPassword: password } = req.body;
      const response = await this.adminService.verifyAdmin(email, password);

      if (!response) {
        res.status(400).json({ message: 'Invalid email or password!' });
        return;
      }

      if (response.refreshToken) {
        res.cookie('refreshToken', response.refreshToken, {
          httpOnly: true,
          sameSite: 'lax',
          maxAge: 7 * 24 * 60 * 60 * 1000,
        });
      }

      if (response.accessToken) {
        res.cookie('accessToken', response.accessToken, {
          httpOnly: true,
          sameSite: 'lax',
          secure: process.env.NODE_ENV === 'production',
          maxAge: 15 * 60 * 1000,
        });
      }

      res.status(200).json({
        success: true,
        accessToken: response.accessToken,
      });
    } catch (error) {
      next(error);
    }
  };

  companiesList: RequestHandler = async (req, res, next) => {
    try {
      const companies = await this.adminService.getCompanies();
      res.status(200).json(companies);
    } catch (error) {
      next(error);
    }
  };

  updateCompanyStatus: RequestHandler = async (req, res, next) => {
    try {
      const { companyId } = req.params;
      const { isActive } = req.body;

      if (typeof isActive !== 'boolean') {
        res.status(400).json({
          success: false,
          message: 'Invalid status value. isActive must be a boolean.',
        });
        return;
      }

      const updatedCompany = await this.adminService.updateCompanyStatus(
        companyId,
        isActive
      );

      if (!updatedCompany) {
        res.status(404).json({
          success: false,
          message: 'Company not found.',
        });
        return;
      }

      res.status(200).json({
        success: true,
        message: 'Company status updated successfully.',
        data: updatedCompany,
      });
    } catch (error) {
      next(error);
    }
  };

  updateCompanyRequest: RequestHandler = async (req, res, next) => {
    try {
      const { companyId } = req.params;
      const { isApproved, reason } = req.body;

      const updatedCompany = await this.adminService.updateCompanyRequest(
        companyId,
        isApproved,
        reason
      );

      if (!updatedCompany) {
        res.status(404).json({
          success: false,
          message: 'Company not found.',
        });
        return;
      }

      res.status(200).json({
        success: true,
        message: 'Company status updated successfully.',
        data: updatedCompany,
      });
    } catch (error) {
      next(error);
    }
  };
}
