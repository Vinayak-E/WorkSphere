import { Request, Response, NextFunction, RequestHandler } from 'express';
import { DepartmentService } from '../../services/company/department.service';
import {
  ICreateDepartment,
  IUpdateDepartment,
} from '../../interfaces/company/IDepartment.types';

export class DepartmentController {
  constructor(private readonly departmentService: DepartmentService) {}

  getDepartments: RequestHandler = async (req, res, next) => {
    try {
      const tenantConnection = req.tenantConnection;

      if (!tenantConnection) {
        res.status(500).json({
          success: false,
          message: 'Tenant connection not established',
        });
        return;
      }

      const departments =
        await this.departmentService.getDepartments(tenantConnection);

      res.status(200).json({
        success: true,
        data: departments,
      });
    } catch (error) {
      console.error('Error fetching departments:', error);
      next(error);
    }
  };

  addDepartment: RequestHandler = async (req, res, next) => {
    try {
      const tenantConnection = req.tenantConnection;

      if (!tenantConnection) {
        res.status(500).json({
          success: false,
          message: 'Tenant connection not established',
        });
        return;
      }

      const { name, description } = req.body;

      if (!name) {
        res.status(400).json({
          success: false,
          message: 'Department name is required',
        });
      }

      const departmentData: ICreateDepartment = {
        name,
        description: description || '',
        status: 'Active',
      };

      const newDepartment = await this.departmentService.addNewDepartment(
        departmentData,
        tenantConnection
      );

      res.status(201).json({
        success: true,
        message: 'Department created successfully',
        data: newDepartment,
      });
    } catch (error) {
      next(error);
    }
  };

  updateDepartment: RequestHandler = async (req, res, next) => {
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
      const { name, description, status } = req.body;

      if (!id) {
        res.status(400).json({
          success: false,
          message: 'Department ID is required',
        });
        return;
      }

      const updateData: IUpdateDepartment = {
        ...(name && { name }),
        ...(description && { description }),
        ...(status && { status }),
      };

      const updatedDepartment = await this.departmentService.updateDepartment(
        id,
        updateData,
        tenantConnection
      );

      res.status(200).json({
        success: true,
        message: 'Department updated successfully',
        data: updatedDepartment,
      });
    } catch (error) {
      next(error);
    }
  };
}
