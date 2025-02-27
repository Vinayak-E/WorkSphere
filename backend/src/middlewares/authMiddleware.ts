import { Request, Response, NextFunction, RequestHandler } from "express";
import jwt from "jsonwebtoken";
import mongoose from "mongoose";
import { ICompanyDocument } from "../interfaces/company/company.types";
import { IEmployee } from "../interfaces/company/IEmployee.types";
import { IUser } from "../interfaces/IUser.types";
import { CompanyService } from "../services/company/company.service";
import { EmployeeRepository } from "../repositories/employee/employeeRepository";
import { UserRepository } from "../repositories/user/userRepository";
import { CompanyRepository } from "../repositories/company/companyRepository";
import { EmployeeService } from "../services/employee/employee.service";
import { AdminService } from "../services/admin/admin.service";
import { AdminRepository } from "../repositories/admin/adminRepository";
import { JwtService } from "../services/jwt.service";

interface JwtPayload {
  email: string;
  role: string;
  tenantId: string;
}

declare global {
  namespace Express {
    interface Request {
      user?: JwtPayload | ICompanyDocument | IEmployee | IUser;
      userId?:string
      isTenantConnected?: boolean;
      tenantId?: string;
      tenantConnection?: mongoose.Connection;
    }
  }
}
export const verifyAuth: RequestHandler = async (req, res, next) => {
  try {
    const token = req.cookies?.accessToken;
    const refreshToken = req.cookies?.refreshToken;

    if (!token && !refreshToken) {
      res.status(401).json({ message: "Authentication token missing" });
      return;
    }

    let decoded: JwtPayload | null = null;

    try {
      decoded = jwt.verify(token, process.env.JWT_SECRETKEY!) as JwtPayload;
    } catch (err) {
      if (!refreshToken) {
        res.status(401).json({ message: "Session expired. Please log in again." });
        return;
      }
      try {
        const refreshDecoded = jwt.verify(refreshToken, process.env.JWT_SECRETKEY!) as JwtPayload;
        const newAccessToken = jwt.sign(
          {
            email: refreshDecoded.email,
            role: refreshDecoded.role,
            tenantId: refreshDecoded.tenantId,
          },
          process.env.JWT_SECRETKEY!,
          { expiresIn: "15m" }
        );

        res.cookie("accessToken", newAccessToken, {
          httpOnly: true,
          secure: process.env.NODE_ENV === "production",
          sameSite: "strict",
        });
        decoded = refreshDecoded;
      } catch (refreshErr) {
        res.status(403).json({ message: "Session expired. Please log in again." });
        return;
      }
    }

    req.user = decoded;

    const employeeRepository = new EmployeeRepository();
    const userRepository = new UserRepository();
    const companyRepository = new CompanyRepository();
    const companyService = new CompanyService(employeeRepository, userRepository, companyRepository);
    const employeeService = new EmployeeService(employeeRepository, userRepository);
    const adminRepository = new AdminRepository();
    const jwtService = new JwtService();
    const adminService = new AdminService(jwtService, adminRepository, companyRepository);


    const tenantConnection = req.tenantConnection;
    if (tenantConnection) {
      let userData:  ICompanyDocument | IEmployee | IUser |null;
      switch (decoded!.role) {
        case "COMPANY":
          userData = await companyService.getCompanyByEmail(decoded!.email, tenantConnection);
          break;
        case "EMPLOYEE":
        case "MANAGER":
          userData = await employeeService.getEmployeeProfile(tenantConnection, decoded!.email);
          break;
        case "ADMIN":
          userData = await adminService.getProfile(decoded!.email);
          break;
        default:
          res.status(403).json({ message: "Invalid role in token payload" });
          return;
      }

      if (!userData) {
        res.status(404).json({ message: "User not found" });
        return;
      }
      req.userId = userData._id;
   
    }

    next();
  } catch (error) {
    console.error("Error in auth middleware:", error);
    res.status(500).json({ message: "Internal server error" });
    return;
  }
};