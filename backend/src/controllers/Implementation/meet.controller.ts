import mongoose from 'mongoose';
import { Connection } from 'mongoose';
import { injectable, inject } from 'tsyringe';
import { Messages } from '../../constants/messages';
import { HttpStatus } from '../../constants/httpStatus';
import { Request, Response, NextFunction } from 'express';
import { IMeetController } from '../Interface/IMeetController';
import { IMeetService } from '../../services/Interface/IMeetService';

@injectable()
export class MeetController implements IMeetController {
  constructor(@inject('MeetService') private meetService: IMeetService) {}

  getMeetings = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const tenantConnection = req.tenantConnection;
      if (!tenantConnection) {
        res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
          success: false,
          message: Messages.TENANT_CONNECTION_ERROR,
        });
        return;
      }

      const userId = req.userId;
      if (!userId) {
        res.status(HttpStatus.UNAUTHORIZED).json({
          success: false,
          message: Messages.USER_ID_NOT_FOUND,
        });
        return;
      }

      const page = parseInt(req.query.page as string) || 1;
      const pageSize = parseInt(req.query.pageSize as string) || 10;
      const dateFilter = req.query.dateFilter as string;
      const startDate = req.query.startDate as string;
      const endDate = req.query.endDate as string;
      const searchQuery = req.query.searchQuery as string;

      const filters: any = {};

      if (dateFilter) {
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        switch (dateFilter) {
          case 'today':
            const tomorrow = new Date(today);
            tomorrow.setDate(tomorrow.getDate() + 1);
            filters.meetDate = {
              $gte: today,
              $lt: tomorrow,
            };
            break;
          case 'tomorrow':
            const tomorrowStart = new Date(today);
            tomorrowStart.setDate(tomorrowStart.getDate() + 1);
            const dayAfterTomorrow = new Date(today);
            dayAfterTomorrow.setDate(dayAfterTomorrow.getDate() + 2);
            filters.meetDate = {
              $gte: tomorrowStart,
              $lt: dayAfterTomorrow,
            };
            break;
          case 'week':
            const weekEnd = new Date(today);
            weekEnd.setDate(weekEnd.getDate() + 7);
            filters.meetDate = {
              $gte: today,
              $lt: weekEnd,
            };
            break;
          case 'custom':
            if (startDate && endDate) {
              const endDateTime = new Date(endDate);
              endDateTime.setHours(23, 59, 59, 999);
              filters.meetDate = {
                $gte: new Date(startDate),
                $lte: endDateTime,
              };
            }
            break;
        }
      }

      if (searchQuery) {
        filters.meetTitle = { $regex: searchQuery, $options: 'i' };
      }

      const { meetings, total } = await this.meetService.getMeetings(
        tenantConnection,
        filters,
        userId,
        page,
        pageSize
      );
      res.status(HttpStatus.OK).json({
        success: true,
        data: meetings,
        total,
        page,
        pageSize,
        totalPages: Math.ceil(total / pageSize),
      });
    } catch (error) {
      next(error);
    }
  };

  createMeeting = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const tenantConnection = req.tenantConnection as Connection;
      if (!req.userId || !req.user) {
        res.status(HttpStatus.UNAUTHORIZED).json({
          success: false,
          message: Messages.USER_ID_NOT_FOUND,
        });
        return;
      }
      const createdByModel =
        req.user.role === 'COMPANY' ? 'Company' : 'Employee';
      const meetingData = {
        ...req.body,
        createdBy: new mongoose.Types.ObjectId(req.userId),
        createdByModel,
      };

      const meeting = await this.meetService.createMeeting(
        tenantConnection,
        meetingData
      );
      res.status(HttpStatus.CREATED).json(meeting);
    } catch (error) {
      next(error);
    }
  };

  updateMeeting = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const tenantConnection = req.tenantConnection as Connection;
      const meeting = await this.meetService.updateMeeting(
        tenantConnection,
        req.params.id,
        req.body
      );
      if (!meeting)
        res
          .status(HttpStatus.NOT_FOUND)
          .json({ message: Messages.MEETING_NOT_FOUND });
      res.status(HttpStatus.OK).json(meeting);
    } catch (error) {
      next(error);
    }
  };

  deleteMeeting = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const tenantConnection = req.tenantConnection as Connection;
      const meeting = await this.meetService.deleteMeeting(
        tenantConnection,
        req.params.id
      );
      if (!meeting)
        res.status(404).json({ message: Messages.MEETING_NOT_FOUND });
      res.status(HttpStatus.NO_CONTENT).send();
    } catch (error) {
      next(error);
    }
  };
}
