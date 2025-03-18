import { inject, injectable } from 'tsyringe';
import { Messages } from '../../constants/messages';
import { HttpStatus } from '../../constants/httpStatus';
import { Request, Response, NextFunction, RequestHandler } from 'express';
import { DepartmentService } from '../../services/Implementation/department.service';
import {
  ICreateDepartment,
  IUpdateDepartment,
} from '../../interfaces/company/IDepartment.types';

@injectable()
export class DepartmentController {
  constructor(
    @inject('DepartmentService') private departmentService: DepartmentService
  ) {}

  getDepartments: RequestHandler = async (req, res, next) => {
    try {
      const tenantConnection = req.tenantConnection;

      if (!tenantConnection) {
        res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
          success: false,
          message: Messages.TENANT_CONNECTION_ERROR,
        });
        return;
      }

      const departments =
        await this.departmentService.getDepartments(tenantConnection);

      res.status(HttpStatus.OK).json({
        success: true,
        data: departments,
      });
    } catch (error) {
      next(error);
    }
  };

  addDepartment: RequestHandler = async (req, res, next) => {
    try {
      const tenantConnection = req.tenantConnection;

      if (!tenantConnection) {
        res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
          success: false,
          message: Messages.TENANT_CONNECTION_ERROR,
        });
        return;
      }

      const { name, description } = req.body;

      if (!name) {
        res.status(HttpStatus.BAD_REQUEST).json({
          success: false,
          message: Messages.DEPARTMENT_NAME_REQUIRED,
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

      res.status(HttpStatus.CREATED).json({
        success: true,
        message: Messages.DEPARTMENT_CREATE_SUCCESS,
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
        res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
          success: false,
          message: Messages.INTERNAL_SERVER_ERROR,
        });
        return;
      }

      const { id } = req.params;
      const { name, description, status } = req.body;

      if (!id) {
        res.status(HttpStatus.BAD_REQUEST).json({
          success: false,
          message: Messages.DEPARTMENT_ID_REQUIRED,
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

      res.status(HttpStatus.OK).json({
        success: true,
        message: Messages.DEPARTMENT_UPDATE_SUCCESS,
        data: updatedDepartment,
      });
    } catch (error) {
      next(error);
    }
  };
}
