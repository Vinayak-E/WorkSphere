import { Request, Response, NextFunction } from 'express';

export interface IMeetController {
  getMeetings(req: Request, res: Response, next: NextFunction): Promise<void>;
  createMeeting(req: Request, res: Response, next: NextFunction): Promise<void>;
  updateMeeting(req: Request, res: Response, next: NextFunction): Promise<void>;
  deleteMeeting(req: Request, res: Response, next: NextFunction): Promise<void>;
}
