
import { NextFunction, Request, Response } from "express";
import { inject, injectable } from "tsyringe";
import { DashboardService } from "../../services/Implementation/dashboard.service";

@injectable()
export class DashboardController {
  constructor(@inject('DashboardService') private dashboardService: DashboardService) {}

  getDashboard = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const tenantConnection = req.tenantConnection;
      if (!tenantConnection) {
        res.status(500).json({ success: false, message: 'Tenant connection not established' });
        return
      }
      const dashboardData = await this.dashboardService.getDashboardData(tenantConnection);
      res.status(200).json({ success: true, data: dashboardData });
    } catch (error) {
      next(error);
    }
  };
}