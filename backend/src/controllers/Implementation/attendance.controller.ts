import { Connection } from 'mongoose';
import { injectable, inject } from 'tsyringe';
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
        res.status(500).json({
          success: false,
          message: 'Tenant connection not established',
        });
        return;
      }
      const employeeId = req.userId;
      if (!employeeId) {
        res.status(401).json({
          success: false,
          message: 'User ID not found',
        });
        return;
      }
      const attendance = await this.attendanceService.checkIn(
        tenantConnection,
        employeeId
      );
      res
        .status(200)
        .json({
          success: true,
          message: 'Checked in successfully',
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
        res
          .status(500)
          .json({
            success: false,
            message: 'Tenant connection not established',
          });
        return;
      }
      const employeeId = req.userId;
      if (!employeeId) {
        res.status(401).json({
          success: false,
          message: 'User ID not found',
        });
        return;
      }
      const attendance = await this.attendanceService.checkOut(
        tenantConnection,
        employeeId
      );
      res
        .status(200)
        .json({
          success: true,
          message: 'Checked out successfully',
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
        res
          .status(500)
          .json({
            success: false,
            message: 'Tenant connection not established',
          });
        return;
      }
      const employeeId = req.userId;
      if (!employeeId) {
        res.status(401).json({
          success: false,
          message: 'User ID not found',
        });
        return;
      }
      const attendance = await this.attendanceService.getTodayAttendance(
        tenantConnection,
        employeeId
      );
      res.status(200).json({ success: true, data: attendance });
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
        res
          .status(500)
          .json({
            success: false,
            message: 'Tenant connection not established',
          });
        return; // Added missing return
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
      console.log('attendance', attendance);
      res.status(200).json({
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
