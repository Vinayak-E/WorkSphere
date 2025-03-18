import { inject, injectable } from 'tsyringe';
import { Messages } from '../../constants/messages';
import { HttpStatus } from '../../constants/httpStatus';
import { NextFunction, Request, Response } from 'express';
import { DashboardService } from '../../services/Implementation/dashboard.service';

@injectable()
export class DashboardController {
  constructor(
    @inject('DashboardService') private dashboardService: DashboardService
  ) {}

  getDashboard = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const tenantConnection = req.tenantConnection;
      if (!tenantConnection) {
        res
          .status(HttpStatus.INTERNAL_SERVER_ERROR)
          .json({ success: false, message: Messages.TENANT_CONNECTION_ERROR });
        return;
      }
      const dashboardData =
        await this.dashboardService.getDashboardData(tenantConnection);
      res.status(HttpStatus.OK).json({ success: true, data: dashboardData });
    } catch (error) {
      next(error);
    }
  };
}
