import { injectable, inject } from 'tsyringe';
import { RequestHandler } from 'express';
import { AdminService } from '../../services/Implementation/admin.service';
import { PaymentService } from '../../services/Implementation/payment.service';

@injectable()
export class AdminController {
  constructor(@inject('AdminService') private readonly adminService: AdminService,
  @inject('PaymentService') private paymentService: PaymentService) {}

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
  companyRequests: RequestHandler = async (req, res, next) => {
    try {
      const companies = await this.adminService.getCompanyRequests();
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

      const updatedCompany = await this.adminService.updateCompanyStatus(companyId, isActive);

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

      const updatedCompany = await this.adminService.updateCompanyRequest(companyId, isApproved, reason);

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

  getRevenueStats :RequestHandler = async (req , res, next) => {
    try {
      console.log("@ get revenueStats")
      const revenueStats = await this.paymentService.getRevenueStats();
       console.log("revenueStats",revenueStats)
      res.status(200).json({
        success: true,
        data: revenueStats,
      });
    } catch (error) {
      console.error('Revenue stats error:', error);
      next(error);
    }
  };

  getCompanyPayments:RequestHandler = async (req, res, next) => {
    try {
      const { companyId } = req.params;
      console.log("companyid",companyId)
      const payments = await this.paymentService.getCompanyPaymentHistory(companyId);
      console.log('payments',payments)
      res.status(200).json({
        success: true,
        data: payments,
      });
    } catch (error) {
      console.error('Company payments error:', error);
      next(error);
    }
  };

  getCompanyById: RequestHandler = async (req, res, next) => {
    try {
      const { id } = req.params;
      
      const companyDetails = await this.adminService.getCompanyDetails(id);
      
      if (!companyDetails) {
         res.status(404).json({
          success: false,
          message: 'Company not found'
        });
        return
      }
      
      res.status(200).json({
        success: true,
        data: companyDetails
      });
    } catch (error) {
      console.error('Get company details error:', error);
      next(error);
    }
  };

}
