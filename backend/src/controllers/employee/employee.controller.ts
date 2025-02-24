import { Request, Response, NextFunction, RequestHandler } from "express";
import { IAuthService } from "../../interfaces/company/company.types";
import { IEmployeeService, IUpdateEmployee } from "../../interfaces/company/IEmployee.types";

export class EmployeeController {
  constructor(private readonly authService: IAuthService,
    private readonly  employeeService :IEmployeeService) {}

  changePassword: RequestHandler = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    const { email, newPassword } = req.body;
    try {

      await this.authService.resetPassword(email, newPassword);
      res.status(200).json({
        success: true,
        message: "Password Changed Successfully",
      });
    } catch (error) {
      next(error);
    }
  };

  getProfile: RequestHandler = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      
      if (!req.user?.email) {
         res.status(401).json({
          success: false,
          message: "User email not found in token"
        });
        return
      }

      if (!req.tenantConnection) {
         res.status(500).json({
          success: false,
          message: "Tenant connection not established"
        });
        return
      }

      const details = await this.employeeService.getEmployeeProfile(
        req.tenantConnection,
        req.user.email
      );

       res.status(200).json({
        success: true,
        data: details
      });
    } catch (error) {
      next(error);
    }
  };





  updateProfile: RequestHandler = async (req: Request, res: Response, next: NextFunction) => {
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
    

      if (!id) {
         res.status(400).json({
        success: false,
        message: "Employee ID is required"
      });
      return
    }

    const updateData: IUpdateEmployee = req.body;

      const updatedEmployee= await this.employeeService.updateProfile(
        id,
        tenantConnection,
        updateData,
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

  checkIn: RequestHandler = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { employeeId} = req.body;
        const tenantConnection = req.tenantConnection;

        if (!tenantConnection) {
            res.status(500).json({
                success: false,
                message: "Tenant connection not established"
            });
            return;
        }

        if (!employeeId ) {
            res.status(400).json({
                success: false,
                message: "Employee ID and Company ID are required"
            });
            return;
        }

        const attendance = await this.employeeService.checkIn(
            tenantConnection,
            employeeId
        );

        res.status(200).json({
            success: true,
            message: "Checked in successfully",
            data: attendance
        });
    } catch (error) {
       
            next(error);
        
    }
};

checkOut: RequestHandler = async (req: Request, res: Response, next: NextFunction) => {
  try {
      const { employeeId } = req.body;
      const tenantConnection = req.tenantConnection;

      if (!tenantConnection) {
          res.status(500).json({
              success: false,
              message: "Tenant connection not established"
          });
          return;
      }

      if (!employeeId) {
          res.status(400).json({
              success: false,
              message: "Employee ID is required"
          });
          return;
      }

      const attendance = await this.employeeService.checkOut(
          tenantConnection,
          employeeId
      );

      res.status(200).json({
          success: true,
          message: "Checked out successfully",
          data: attendance
      });
  } catch (error) {
      next(error);
  }
};

getAttendanceStatus: RequestHandler = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id: employeeId } = req.params;
      const tenantConnection = req.tenantConnection;

        
      if (!tenantConnection) {
          res.status(500).json({
              success: false,
              message: "Tenant connection not established"
          });
          return;
      }

      const attendance = await this.employeeService.getAttendanceStatus(
          tenantConnection,
          employeeId
      );



      res.status(200).json({
          success: true,
          data: attendance
      });
  } catch (error) {
      next(error);
  }
};

getLeaves: RequestHandler = async (req, res, next) => {
  try {
    const tenantConnection = req.tenantConnection;
    if (!tenantConnection) {
      res.status(500).json({ success: false, message: "Tenant connection failed" })
      return;
    }

    const email = req.user?.email;
    if (!email) {
       res.status(401).json({ success: false, message: "Unauthorized" });
       return;
    }

    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const { startDate, endDate } = req.query;

    const { leaves, total } = await this.employeeService.getLeaves(
      tenantConnection,
      email,
      page,
      limit,
      startDate?.toString(),
      endDate?.toString()
    );

    res.status(200).json({
      success: true,
      leaves,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
    });
  } catch (error) {
    next(error);
  }
};

applyLeave: RequestHandler = async (req, res, next) => {
  try {
    const tenantConnection = req.tenantConnection;
    if (!tenantConnection) {
      res.status(500).json({ success: false, message: "Tenant connection failed" });
      return 
    }

    
    const email = req.user?.email;
    if (!email) {
       res.status(401).json({ success: false, message: "Unauthorized" });
       return
    }

    const { startDate, endDate, reason } = req.body;
    const leave = await this.employeeService.applyLeave(
      tenantConnection,
      email,
      startDate,
      endDate,
      reason
    );

    res.status(201).json({ success: true, data: leave });
  } catch (error) {
    next(error);
  }
};

getDepartmentEmployees: RequestHandler = async (
  req: Request,
  res: Response, 
  next: NextFunction
) => {
  try {
    const tenantConnection = req.tenantConnection;
    
    if (!tenantConnection) {
      res.status(500).json({
        success: false,
        message: "Tenant connection not established"
      });
      return;
    }

    const userEmail = req.user?.email;
    if (!userEmail) {
      res.status(401).json({
        success: false,
        message: "User not authenticated"
      });
      return;
    }

    const employees = await this.employeeService.getDepartmentEmployees(
      tenantConnection,
      userEmail
    );

    res.status(200).json({
      success: true,
      data: employees
    });

  } catch (error) {
    next(error);
  }
};
}




