import { injectable, inject } from 'tsyringe';
import { Messages } from '../../constants/messages';
import { HttpStatus } from '../../constants/httpStatus';
import { ILeaveController } from '../Interface/ILeaveController';
import { ILeaveService } from '../../services/Interface/ILeaveService';
import { NextFunction, Request, RequestHandler, Response } from 'express';

@injectable()
export class LeaveController implements ILeaveController {
  constructor(@inject('LeaveService') private leaveService: ILeaveService) {}

  applyLeave = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const tenantConnection = req.tenantConnection;
      if (!tenantConnection) {
        res
          .status(HttpStatus.INTERNAL_SERVER_ERROR)
          .json({ success: false, message: Messages.TENANT_CONNECTION_ERROR });
        return;
      }
      const employeeId = req.userId;
      if (!employeeId) {
        res.status(HttpStatus.UNAUTHORIZED).json({
          success: false,
          message: Messages.USER_ID_NOT_FOUND,
        });
        return;
      }
      const { startDate, endDate, reason, leaveType } = req.body;
      const leaveData = { startDate, endDate, reason, leaveType };
      const leave = await this.leaveService.applyLeave(
        tenantConnection,
        employeeId,
        leaveData
      );
      res.status(HttpStatus.CREATED).json({ success: true, data: leave });
    } catch (error) {
      next(error);
    }
  };

  getEmployeeLeaves = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const tenantConnection = req.tenantConnection;
      if (!tenantConnection) {
        res
          .status(HttpStatus.INTERNAL_SERVER_ERROR)
          .json({ success: false, message: Messages.TENANT_CONNECTION_ERROR });
        return;
      }
      const employeeId = req.userId;
      if (!employeeId) {
        res.status(HttpStatus.UNAUTHORIZED).json({
          success: false,
          message: Messages.USER_ID_NOT_FOUND,
        });
        return;
      }
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;
      const { startDate, endDate } = req.query;
      const filters: any = {};
      if (startDate)
        filters.startDate = { $gte: new Date(startDate as string) };
      if (endDate) filters.endDate = { $lte: new Date(endDate as string) };
      const { leaves, total } = await this.leaveService.getEmployeeLeaves(
        tenantConnection,
        employeeId,
        page,
        limit,
        filters
      );
      res.status(HttpStatus.OK).json({
        success: true,
        leaves,
        total,
        totalPages: Math.ceil(total / limit),
        currentPage: page,
      });
    } catch (error) {
      next(error);
    }
  };

  getAllLeaves = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const tenantConnection = req.tenantConnection;
      if (!tenantConnection) {
        res
          .status(HttpStatus.INTERNAL_SERVER_ERROR)
          .json({ success: false, message: Messages.TENANT_CONNECTION_ERROR });
        return;
      }
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;
      const { startDate, endDate, status } = req.query;
      const filters: any = {};
      if (startDate)
        filters.startDate = { $gte: new Date(startDate as string) };
      if (endDate) filters.endDate = { $lte: new Date(endDate as string) };
      if (status) filters.status = status;
      const { leaves, total } = await this.leaveService.getAllLeaves(
        tenantConnection,
        page,
        limit,
        filters
      );
      res.status(HttpStatus.OK).json({
        success: true,
        leaves,
        total,
        totalPages: Math.ceil(total / limit),
        currentPage: page,
      });
    } catch (error) {
      next(error);
    }
  };

  updateLeaveStatus = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const tenantConnection = req.tenantConnection;
      if (!tenantConnection) {
        res
          .status(HttpStatus.INTERNAL_SERVER_ERROR)
          .json({ success: false, message: Messages.TENANT_CONNECTION_ERROR });
        return;
      }
      const { id } = req.params;
      const { status } = req.body;
      const updatedLeave = await this.leaveService.updateLeaveStatus(
        tenantConnection,
        id,
        status
      );
      if (!updatedLeave) {
        res
          .status(HttpStatus.NOT_FOUND)
          .json({ success: false, message: Messages.LEAVE_NOT_FOUND });
        return;
      }

      res.status(HttpStatus.OK).json({
        success: true,
        message: Messages.LEAVE_UPDATE_SUCCESS,
        data: updatedLeave,
      });
    } catch (error) {
      next(error);
    }
  };
}
