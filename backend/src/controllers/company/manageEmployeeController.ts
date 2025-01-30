import { Request, Response, NextFunction } from "express";
import { RequestHandler } from "express-serve-static-core";
import { ICreateEmployee, IUpdateEmployee } from "../../interfaces/company/IEmployee.types";
import { CompanyService } from "../../services/company/company.service";

export class ManageEmployeeController {
    constructor(private readonly companyService: CompanyService) {}


    getEmployees: RequestHandler = async ( req: Request, res: Response,next: NextFunction) => {
        try {
          const tenantConnection = req.tenantConnection;
          
          if (!tenantConnection) {
               res.status(500).json({ 
              success: false,
              message: "Tenant connection not established" 
            });
            return
          }
    
          const employees = await this.companyService.getEmployees(tenantConnection);

             res.status(200).json({
            success: true,
            data: employees
          });
        } catch (error) {
          console.error("Error fetching employees:", error);
          next(error);
        }
      };

    addEmployee: RequestHandler = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const tenantConnection = req.tenantConnection;
            const tenantId = req.tenantId
            if (!tenantConnection || !tenantId) {
                 res.status(500).json({ 
                    success: false,
                    message: "Tenant connection not established" 
                });
                return
            }
            const employeeData: ICreateEmployee = req.body;
           console.log("employeeData",employeeData);
           
            const newEmployee = await this.companyService.addEmployee(employeeData, tenantConnection,tenantId);

             res.status(201).json({
                success: true,
                message: "Employee created successfully",
                data: newEmployee
            });
        } catch (error) {
            next(error);
        }
    };


    updateEmployee: RequestHandler = async (req: Request, res: Response, next: NextFunction) => {
        try {
          const tenantConnection = req.tenantConnection;
          
          if (!tenantConnection) {
        res.status(500).json({ 
              success: false,
              message: "Tenant connection not established" 
            });
            return
          }
    
          const { id } = req.params;
        
          console.log('reqId at updateemploye',req.params)
          console.log('req.body at updateemploye',req.body)
    
          if (!id) {
             res.status(400).json({
            success: false,
            message: "Employee ID is required"
          });
          return
        }
    
        const updateData: IUpdateEmployee = req.body;
    
          const updatedEmployee= await this.companyService.updateEmployee(
            id,
            updateData,
            tenantConnection
          );
    
            res.status(200).json({
            success: true,
            message: "Employee updated successfully",
            data: updatedEmployee
          });
        } catch (error) {
          next(error);
        }
      };
}
