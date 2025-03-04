import { Request, Response, NextFunction } from 'express';

export interface ILeaveController {
    applyLeave(req: Request, res: Response, next: NextFunction): Promise<void>;
    getEmployeeLeaves(req: Request, res: Response, next: NextFunction): Promise<void>;
    getAllLeaves(req: Request, res: Response, next: NextFunction): Promise<void>;
    updateLeaveStatus(req: Request, res: Response, next: NextFunction): Promise<void>;
}
