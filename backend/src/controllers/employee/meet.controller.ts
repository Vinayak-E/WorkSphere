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
                return;
            }
    
            const userId = req.userId;
            if (!userId) {
                res.status(401).json({
                    success: false,
                    message: "User ID not found"
                });
                return;
            }
            console.log('oiiiiiiiiiiiiiiiiiiiiiiiii');
            
    
            // Parse query parameters
            const page = parseInt(req.query.page as string) || 1;
            const pageSize = parseInt(req.query.pageSize as string) || 10;
            const dateFilter = req.query.dateFilter as string;
            const startDate = req.query.startDate as string;
            const endDate = req.query.endDate as string;
            const searchQuery = req.query.searchQuery as string;
    
            // Create filters object
            const filters: any = {};
    
            // Apply date filters
            if (dateFilter) {
                const today = new Date();
                today.setHours(0, 0, 0, 0);
    
                switch (dateFilter) {
                    case 'today':
                        const tomorrow = new Date(today);
                        tomorrow.setDate(tomorrow.getDate() + 1);
                        filters.meetDate = {
                            $gte: today,
                            $lt: tomorrow
                        };
                        break;
                    case 'tomorrow':
                        const tomorrowStart = new Date(today);
                        tomorrowStart.setDate(tomorrowStart.getDate() + 1);
                        const dayAfterTomorrow = new Date(today);
                        dayAfterTomorrow.setDate(dayAfterTomorrow.getDate() + 2);
                        filters.meetDate = {
                            $gte: tomorrowStart,
                            $lt: dayAfterTomorrow
                        };
                        break;
                    case 'week':
                        const weekEnd = new Date(today);
                        weekEnd.setDate(weekEnd.getDate() + 7);
                        filters.meetDate = {
                            $gte: today,
                            $lt: weekEnd
                        };
                        break;
                    case 'custom':
                        if (startDate && endDate) {
                            const endDateTime = new Date(endDate);
                            endDateTime.setHours(23, 59, 59, 999);
                            filters.meetDate = {
                                $gte: new Date(startDate),
                                $lte: endDateTime
                            };
                        }
                        break;
                }
            }
    
            // Apply search query if present
            if (searchQuery) {
                filters.meetTitle = { $regex: searchQuery, $options: 'i' };
            }
                 
console.log("filters",filters)
console.log("page",page)
console.log(pageSize,"pagesixw");


            const { meetings, total } = await this.meetService.getMeetings(
                tenantConnection,
                filters,
                userId,
                page,
                pageSize
            );
            console.log("res",meetings,total)
            res.status(200).json({
                success: true,
                data: meetings,
                total,
                page,
                pageSize,
                totalPages: Math.ceil(total / pageSize)
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
            if (!req.user) {
                res.status(401).json({
                    success: false,
                    message: "User not authenticated"
                });
                return;
            }
            console.log("role",req.user.role)
            const createdByModel = req.user.role === "COMPANY" ? "Company" : "Employee";
            const meetingData = {
                ...req.body,
                createdBy: new mongoose.Types.ObjectId(req.userId),
                createdByModel
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

    updateMeeting = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const tenantConnection = req.tenantConnection;
            if (!tenantConnection) {
                res.status(500).json({
                    success: false,
                    message: "Tenant connection not established"
                });
                return;
            }
            const meetingId = req.params.id;
            const meetingData = req.body;
            console.log('meetingId', meetingId);
            console.log('meetingData', meetingData);
    
            const updatedMeeting = await this.meetService.updateMeeting(tenantConnection, meetingId, meetingData);
            res.status(200).json({
                success: true,
                data: updatedMeeting,
            });
        } catch (error) {
            next(error);
        }
    };
    deleteMeeting = async (req: Request, res: Response, next: NextFunction) => {
        try {
          const tenantConnection = req.tenantConnection;
          if (!tenantConnection) {
            res.status(500).json({
              success: false,
              message: "Tenant connection not established"
            });
            return;
          }
          const meetingId = req.params.id;
          await this.meetService.deleteMeeting(tenantConnection, meetingId);
          res.status(200).json({
            success: true,
            message: "Meeting deleted successfully"
          });
        } catch (error) {
          next(error);
        }
    
}
}