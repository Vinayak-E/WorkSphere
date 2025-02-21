import { Request, Response, NextFunction } from 'express';
import { IMeetService } from '../../interfaces/IMeet.types';
import mongoose from 'mongoose';

export class MeetController {
    constructor(private readonly meetService :IMeetService) {}

    getMeetings = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const tenantConnection = req.tenantConnection;
            if (!tenantConnection) {
               res.status(500).json({
                success: false,
                message: "Tenant connection not established"
              });
              return
            }
            const filters: any = {};
             const userId = req.userId

     
            if (!userId) {
                res.status(401).json({
                    success: false,
                    message: "User ID not found"
                });
                return;
            }

            if (req.query.date) {
                filters.meetDate = new Date(req.query.date as string);
            }
            
            const meetings = await this.meetService.getMeetings(tenantConnection,filters, userId);
            
            res.status(200).json({
                success: true,
                count: meetings.length,
                data: meetings
            });
        } catch (error) {
            next(error);
        }
    };

    createMeeting = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const tenantConnection = req.tenantConnection;
            if (!tenantConnection) {
                res.status(500).json({
                    success: false,
                    message: "Tenant connection not established"
                });
                return;
            }
        
            if (!req.userId) {
                res.status(401).json({
                    success: false,
                    message: "User not authenticated"
                });
                return;
            }
          
            const meetingData = {
                ...req.body,
                createdBy: new mongoose.Types.ObjectId(req.userId)
            };
          
            const newMeeting = await this.meetService.createMeeting(tenantConnection,meetingData);
          
            res.status(201).json({
                success: true,
                data: newMeeting,
                message: 'Meeting created successfully'
            });
        } catch (error) {
            next(error);
        }
    };
}