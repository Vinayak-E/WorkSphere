import express from "express";
import { CompanyRepository } from "../../repositories/company/companyRepository";
import { CompanyService } from "../../services/company/company.service";
import { UserRepository } from "../../repositories/user/userRepository";
import { JwtService } from "../../services/jwt.service";
import { EmployeeController } from "../../controllers/Implementation/employee/employee.controller";

const router = express.Router();
const jwtService  = new JwtService()
const userRepository = new UserRepository();
const companyRepository = new CompanyRepository();
const companyService = new CompanyService(companyRepository,userRepository,jwtService);
const employeeController = new EmployeeController(companyService);


router.post('/changePassword', employeeController.changePassword);


export default router;
