import { Request, Response, NextFunction } from 'express';
import { RequestHandler } from 'express-serve-static-core';
import {
  ICreateEmployee,
  IUpdateEmployee,
} from '../../interfaces/company/IEmployee.types';
import { CompanyService } from '../../services/company/company.service';

export class ManageEmployeeController {
  constructor(private readonly companyService: CompanyService) {}

  getEmployees: RequestHandler = async (req, res, next) => {
    try {
      const tenantConnection = req.tenantConnection;

      if (!tenantConnection) {
        res.status(500).json({
          success: false,
          message: 'Tenant connection not established',
        });
        return;
      }

      const employees =
        await this.companyService.getEmployees(tenantConnection);

      res.status(200).json({
        success: true,
        data: employees,
      });
    } catch (error) {
      console.error('Error fetching employees:', error);
      next(error);
    }
  };

  addEmployee: RequestHandler = async (req, res, next) => {
    try {
      const tenantConnection = req.tenantConnection;
      const tenantId = req.tenantId;
      if (!tenantConnection || !tenantId) {
        res.status(500).json({
          success: false,
          message: 'Tenant connection not established',
        });
        return;
      }
      const employeeData: ICreateEmployee = req.body;

      const newEmployee = await this.companyService.addEmployee(
        employeeData,
        tenantConnection,
        tenantId
      );

      res.status(201).json({
        success: true,
        message: 'Employee created successfully',
        data: newEmployee,
      });
    } catch (error) {
      next(error);
    }
  };

  updateEmployee: RequestHandler = async (req, res, next) => {
    try {
      const tenantConnection = req.tenantConnection;

      if (!tenantConnection) {
        res.status(500).json({
          success: false,
          message: 'Tenant connection not established',
        });
        return;
      }

      const { id } = req.params;

      if (!id) {
        res.status(400).json({
          success: false,
          message: 'Employee ID is required',
        });
        return;
      }

      const updateData: IUpdateEmployee = req.body;

      const updatedEmployee = await this.companyService.updateEmployee(
        id,
        updateData,
        tenantConnection
      );

      res.status(200).json({
        success: true,
        message: 'Employee updated successfully',
        data: updatedEmployee,
      });
    } catch (error) {
      next(error);
    }
  };

  getLeaveRequests: RequestHandler = async (req, res, next) => {
    try {
      const tenantConnection = req.tenantConnection;

      if (!tenantConnection) {
        res.status(500).json({
          success: false,
          message: 'Tenant connection not established',
        });
        return;
      }

      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;
      const { startDate, endDate, status } = req.query;

      const { leaves, total } = await this.companyService.getLeaves(
        tenantConnection,
        page,
        limit,
        startDate?.toString(),
        endDate?.toString(),
        status?.toString()
      );

      res.status(200).json({
        success: true,
        leaves,
        total,
        totalPages: Math.ceil(total / limit),
        currentPage: page,
      });
    } catch (error) {
      console.error('Error fetching leaves:', error);
      next(error);
    }
  };

  updateLeaveStatus: RequestHandler = async (req, res, next) => {
    try {
      const tenantConnection = req.tenantConnection;

      if (!tenantConnection) {
        res.status(500).json({
          success: false,
          message: 'Tenant connection not established',
        });
        return;
      }

      const { id } = req.params;
      const { status } = req.body;

      if (!id) {
        res.status(400).json({
          success: false,
          message: 'Leave ID is required',
        });
        return;
      }

      const updatedLeave = await this.companyService.updateLeaveStatus(
        id,
        status,
        tenantConnection
      );

      res.status(200).json({
        success: true,
        message: 'Leave status updated successfully',
        data: updatedLeave,
      });
    } catch (error) {
      console.error('Error updating leave status:', error);
      next(error);
    }
  };

  getAttendance: RequestHandler = async (req, res, next) => {
    try {
      const tenantConnection = req.tenantConnection;

      if (!tenantConnection) {
        res.status(500).json({
          success: false,
          message: 'Tenant connection not established',
        });
        return;
      }

      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;
      const date = req.query.date as string;

      const { attendance, total } = await this.companyService.getAttendance(
        tenantConnection,
        page,
        limit,
        date
      );

      res.status(200).json({
        success: true,
        attendance,
        total,
        totalPages: Math.ceil(total / limit),
        currentPage: page,
      });
    } catch (error) {
      console.error('Error fetching attendance:', error);
      next(error);
    }
  };
}
