import { injectable, inject } from 'tsyringe';
import { Messages } from '../../constants/messages';
import { HttpStatus } from '../../constants/httpStatus';
import { Request, Response, NextFunction, RequestHandler } from 'express';
import { ICompanyDocument } from '../../interfaces/company/company.types';
import { CompanyService } from '../../services/Implementation/company.service';
import { PaymentService } from '../../services/Implementation/payment.service';

@injectable()
export class CompanyController {
  constructor(
    @inject('CompanyService') private readonly companyService: CompanyService,
    @inject('PaymentService') private paymentService: PaymentService
  ) {}

  updateProfile = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const tenantConnection = req.tenantConnection;
      if (!tenantConnection) {
        res
          .status(HttpStatus.INTERNAL_SERVER_ERROR)
          .json({ success: false, message: Messages.TENANT_CONNECTION_ERROR });
        return;
      }
      const { id } = req.params;
      if (!id) {
        res
          .status(HttpStatus.BAD_REQUEST)
          .json({ success: false, message: Messages.MISSING_FIELDS });
        return;
      }
      const updateData: ICompanyDocument = req.body;
      const updatedCompany = await this.companyService.updateProfile(
        id,
        tenantConnection,
        updateData
      );
      res.status(HttpStatus.OK).json({
        success: true,
        message: Messages.COMPANY_UPDATED,
        data: updatedCompany,
      });
      return;
    } catch (error) {
      next(error);
    }
  };

  getEmployees = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const tenantConnection = req.tenantConnection;
      if (!tenantConnection) {
        res
          .status(HttpStatus.INTERNAL_SERVER_ERROR)
          .json({ success: false, message: Messages.TENANT_CONNECTION_ERROR });
        return;
      }
      const employees =
        await this.companyService.getEmployees(tenantConnection);
      res.status(HttpStatus.OK).json({ success: true, data: employees });
      return;
    } catch (error) {
      next(error);
    }
  };

  addEmployee = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const tenantConnection = req.tenantConnection;
      const tenantId = req.tenantId;
      if (!tenantConnection || !tenantId) {
        res
          .status(HttpStatus.INTERNAL_SERVER_ERROR)
          .json({ success: false, message: Messages.TENANT_CONNECTION_ERROR });
        return;
      }
      const employeeData = req.body;
      const newEmployee = await this.companyService.addEmployee(
        employeeData,
        tenantConnection,
        tenantId
      );
      res.status(HttpStatus.CREATED).json({
        success: true,
        message: Messages.EMPLOYEE_CREATED,
        data: newEmployee,
      });
      return;
    } catch (error) {
      next(error);
    }
  };

  updateEmployee = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const tenantConnection = req.tenantConnection;
      if (!tenantConnection) {
        res
          .status(HttpStatus.INTERNAL_SERVER_ERROR)
          .json({ success: false, message: Messages.TENANT_CONNECTION_ERROR });
        return;
      }
      const { id } = req.params;
      if (!id) {
        res
          .status(HttpStatus.BAD_REQUEST)
          .json({ success: false, message: Messages.EMPLOYEE_ID_REQUIRED });
        return;
      }
      const updateData = req.body;
      const updatedEmployee = await this.companyService.updateEmployee(
        id,
        updateData,
        tenantConnection
      );
      res.status(HttpStatus.OK).json({
        success: true,
        message: Messages.EMPLOYEE_UPDATE_SUCCESS,
        data: updatedEmployee,
      });
      return;
    } catch (error) {
      next(error);
    }
  };

  getCompanyPaymentHistory = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const companyId = req.tenantId;
      if (!companyId) {
        res.status(HttpStatus.BAD_REQUEST).json({
          success: false,
          message: Messages.COMPANY_ID_NOT_FOUND,
        });
        return;
      }

      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;

      const { payments, total } =
        await this.paymentService.getCompanyPaymentHistory(
          companyId,
          page,
          limit
        );
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
      next(error);
    }
  };

  getCurrentPlan = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const companyId = req.userId;
      const tenantId = req.tenantId;

      if (!companyId || !tenantId) {
        res.status(HttpStatus.BAD_REQUEST).json({
          success: false,
          message: Messages.MISSING_COMPANY_OR_TENANT_ID,
        });
        return;
      }
      const currentPlan = await this.paymentService.getCompanyCurrentPlan(
        companyId,
        tenantId
      );
      res.status(HttpStatus.OK).json({
        success: true,
        data: currentPlan,
      });
    } catch (error) {
      next(error);
    }
  };
}
