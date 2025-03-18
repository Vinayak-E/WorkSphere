import { Connection } from 'mongoose';
import { injectable, inject } from 'tsyringe';
import { Messages } from '../../constants/messages';
import { HttpStatus } from '../../constants/httpStatus';
import { NextFunction, Request, Response } from 'express';
import { IAttendanceController } from '../Interface/IAttendanceController';
import { IAttendanceService } from '../../services/Interface/IAttendanceService';

@injectable()
export class AttendanceController implements IAttendanceController {
  constructor(
    @inject('AttendanceService') private attendanceService: IAttendanceService
  ) {}

  checkIn = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const tenantConnection = req.tenantConnection;
      if (!tenantConnection) {
        res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
          success: false,
          message: Messages.TENANT_CONNECTION_ERROR,
        });
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

      const attendance = await this.attendanceService.checkIn(
        tenantConnection,
        employeeId
      );
      res.status(HttpStatus.OK).json({
        success: true,
        message: Messages.CHECK_IN_SUCCESS,
        data: attendance,
      });
    } catch (error) {
      next(error);
    }
  };

  checkOut = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const tenantConnection = req.tenantConnection as Connection;
      if (!tenantConnection) {
        res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
          success: false,
          message: Messages.TENANT_CONNECTION_ERROR,
        });
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

      const attendance = await this.attendanceService.checkOut(
        tenantConnection,
        employeeId
      );
      res.status(HttpStatus.OK).json({
        success: true,
        message: Messages.CHECK_OUT_SUCCESS,
        data: attendance,
      });
    } catch (error) {
      next(error);
    }
  };

  getTodayAttendance = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const tenantConnection = req.tenantConnection as Connection;
      if (!tenantConnection) {
        res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
          success: false,
          message: Messages.TENANT_CONNECTION_ERROR,
        });
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

      const attendance = await this.attendanceService.getTodayAttendance(
        tenantConnection,
        employeeId
      );
      res.status(HttpStatus.OK).json({
        success: true,
        data: attendance,
      });
    } catch (error) {
      next(error);
    }
  };

  getAllAttendance = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const tenantConnection = req.tenantConnection as Connection;
      if (!tenantConnection) {
        res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
          success: false,
          message: Messages.TENANT_CONNECTION_ERROR,
        });
        return;
      }

      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;
      const { date } = req.query;
      const filters: any = {};
      if (date) filters.date = new Date(date as string);

      const { attendance, total } =
        await this.attendanceService.getAllAttendance(
          tenantConnection,
          page,
          limit,
          filters
        );

      res.status(HttpStatus.OK).json({
        success: true,
        attendance,
        total,
        totalPages: Math.ceil(total / limit),
        currentPage: page,
      });
    } catch (error) {
      next(error);
    }
  };
}
