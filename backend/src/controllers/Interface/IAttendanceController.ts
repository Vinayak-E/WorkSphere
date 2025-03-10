import { Request, Response, NextFunction } from 'express';

export interface IAttendanceController {
  checkIn(req: Request, res: Response, next: NextFunction): Promise<void>;
  checkOut(req: Request, res: Response, next: NextFunction): Promise<void>;
  getTodayAttendance(req: Request, res: Response, next: NextFunction): Promise<void>;
  getAllAttendance(req: Request, res: Response, next: NextFunction): Promise<void>;
}
