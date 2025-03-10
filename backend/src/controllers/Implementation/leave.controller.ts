import { NextFunction, Request, RequestHandler, Response } from 'express';
import { injectable, inject } from 'tsyringe';
import { LeaveService } from '../../services/Implementation/leave.service';
import { sendEmail } from '../../utils/email';
import { ILeaveController } from '../Interface/ILeaveController';
import { ILeaveService } from '../../services/Interface/ILeaveService';

@injectable()
export class LeaveController implements ILeaveController {
  constructor(@inject('LeaveService') private leaveService: ILeaveService) {}

  applyLeave = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const tenantConnection = req.tenantConnection;
      if (!tenantConnection) {
      res.status(500).json({ success: false, message: 'Tenant connection not established' });
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
      const { startDate, endDate, reason, leaveType } = req.body;
      const leaveData = { startDate, endDate, reason, leaveType };
      const leave = await this.leaveService.applyLeave(tenantConnection, employeeId, leaveData);
      res.status(201).json({ success: true, data: leave });
    } catch (error) {
      next(error);
    }
  };

  // Employee: Get own leaves
  getEmployeeLeaves = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const tenantConnection = req.tenantConnection;
      if (!tenantConnection) {
        res.status(500).json({ success: false, message: 'Tenant connection not established' });
        return 
      }
      const employeeId = req.userId;
      if (!employeeId) {
        res.status(401).json({
          success: false,
          message: 'User ID not found',
        });
        return;
      }
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;
      const { startDate, endDate } = req.query;
      const filters: any = {};
      if (startDate) filters.startDate = { $gte: new Date(startDate as string) };
      if (endDate) filters.endDate = { $lte: new Date(endDate as string) };
      const { leaves, total } = await this.leaveService.getEmployeeLeaves(
        tenantConnection,
        employeeId,
        page,
        limit,
        filters
      );
      res.status(200).json({
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

  // Company: Get all leave requests
  getAllLeaves = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const tenantConnection = req.tenantConnection;
      if (!tenantConnection) {
         res.status(500).json({ success: false, message: 'Tenant connection not established' });
         return
      }
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;
      const { startDate, endDate, status } = req.query;
      const filters: any = {};
      if (startDate) filters.startDate = { $gte: new Date(startDate as string) };
      if (endDate) filters.endDate = { $lte: new Date(endDate as string) };
      if (status) filters.status = status;
      const { leaves, total } = await this.leaveService.getAllLeaves(
        tenantConnection,
        page,
        limit,
        filters
      );
      res.status(200).json({
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

  // Company: Update leave status
  updateLeaveStatus = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const tenantConnection = req.tenantConnection;
      if (!tenantConnection) {
        res.status(500).json({ success: false, message: 'Tenant connection not established' });
        return
      }
      const { id } = req.params;
      const { status } = req.body;
      const updatedLeave = await this.leaveService.updateLeaveStatus(tenantConnection, id, status);
      if (!updatedLeave) {
        res.status(404).json({ success: false, message: 'Leave not found' });
        return 
      }
      // Send email notification
      // const employee = await this.employeeRepository.findById(updatedLeave.employeeId.toString(), tenantConnection);
      // if (employee && employee.email) {
      //   const statusMessage = `Your leave request from ${new Date(updatedLeave.startDate).toLocaleDateString()} to ${new Date(updatedLeave.endDate).toLocaleDateString()} has been ${status.toLowerCase()}.`;
      //   await sendEmail(employee.email, 'Leave Request Status Update', statusMessage);
      // }
      res.status(200).json({
        success: true,
        message: 'Leave status updated successfully',
        data: updatedLeave,
      });
    } catch (error) {
      next(error);
    }
  };
}