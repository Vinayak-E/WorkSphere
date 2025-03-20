import { RequestHandler } from 'express';
import { injectable, inject } from 'tsyringe';
import { Messages } from '../../constants/messages';
import { HttpStatus } from '../../constants/httpStatus';
import { AdminService } from '../../services/Implementation/admin.service';
import { PaymentService } from '../../services/Implementation/payment.service';

@injectable()
export class AdminController {
  constructor(
    @inject('AdminService') private readonly adminService: AdminService,
    @inject('PaymentService') private paymentService: PaymentService
  ) {}

  adminLogin: RequestHandler = async (req, res, next) => {
    try {
      console.log('req.body',req.body)
      const {  email,  password } = req.body;
      const response = await this.adminService.verifyAdmin(email, password);

      if (!response) {
        res.status(HttpStatus.BAD_REQUEST).json({ message: Messages.INVALID_CREDENTIALS });
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

      res.status(HttpStatus.OK).json({
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
      res.status(HttpStatus.OK).json(companies);
    } catch (error) {
      next(error);
    }
  };

  companyRequests: RequestHandler = async (req, res, next) => {
    try {
      const companies = await this.adminService.getCompanyRequests();
      res.status(HttpStatus.OK).json(companies);
    } catch (error) {
      next(error);
    }
  };

  updateCompanyStatus: RequestHandler = async (req, res, next) => {
    try {
      const { companyId } = req.params;
      const { isActive } = req.body;
      if (typeof isActive !== 'boolean') {
        res.status(HttpStatus.BAD_REQUEST).json({
          success: false,
          message: Messages.INVALID_STATUS,
        });
        return;
      }

      const updatedCompany = await this.adminService.updateCompanyStatus(companyId, isActive);

      if (!updatedCompany) {
        res.status(HttpStatus.NOT_FOUND).json({
          success: false,
          message: Messages.COMPANY_NOT_FOUND,
        });
        return;
      }

      res.status(HttpStatus.OK).json({
        success: true,
        message: Messages.STATUS_UPDATED,
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
        res.status(HttpStatus.NOT_FOUND).json({
          success: false,
          message: Messages.COMPANY_NOT_FOUND,
        });
        return;
      }

      res.status(HttpStatus.OK).json({
        success: true,
        message: Messages.STATUS_UPDATED,
        data: updatedCompany,
      });
    } catch (error) {
      next(error);
    }
  };

  getRevenueStats: RequestHandler = async (req, res, next) => {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;
      const revenueStats = await this.paymentService.getRevenueStats(page, limit);

      res.status(HttpStatus.OK).json({
        success: true,
        data: {
          ...revenueStats,
          currentPage: page,
          totalPages: Math.ceil(revenueStats.totalRecentPayments / limit),
        },
      });
    } catch (error) {
      console.error('Revenue stats error:', error);
      next(error);
    }
  };

  getCompanyPayments: RequestHandler = async (req, res, next) => {
    try {
      const { companyId } = req.params;
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;
      const { payments, total } = await this.paymentService.getCompanyPaymentHistory(companyId, page, limit);

      console.log('payments', payments);
      console.log('total', total);

      res.status(HttpStatus.OK).json({
        success: true,
        data: {
          payments,
          currentPage: page,
          totalPages: Math.ceil(total / limit),
          totalCount: total,
        },
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
        res.status(HttpStatus.NOT_FOUND).json({
          success: false,
          message: Messages.COMPANY_NOT_FOUND,
        });
        return;
      }

      res.status(HttpStatus.OK).json({
        success: true,
        data: companyDetails,
      });
    } catch (error) {
      console.error('Get company details error:', error);
      next(error);
    }
  };
}
