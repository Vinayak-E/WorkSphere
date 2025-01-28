import express from "express";
import { CompanyRepository } from "../../repositories/company/companyRepository";
import { UserRepository } from "../../repositories/user/userRepository";
import { JwtService } from "../../services/jwt.service";
import { EmployeeController } from "../../controllers/Implementation/employee/employee.controller";
import { AuthService } from "../../services/Implementation/authentication.service";
import { tenantMiddleware } from "../../middlewares/tenantMiddleware";
import { verifyAuth } from "../../middlewares/authMiddleware";
import { EmployeeRepository } from "../../repositories/company/employeeRepository";
import { EmployeeService } from "../../services/company/employees.service";
const router = express.Router();
const jwtService  = new JwtService()
const userRepository = new UserRepository();
const companyRepository = new CompanyRepository();
const employeeRepository = new EmployeeRepository()
const employeeService = new EmployeeService(employeeRepository,userRepository)
const authService = new AuthService(companyRepository,userRepository,jwtService);
const employeeController = new EmployeeController(authService,employeeService);



router.post('/changePassword', employeeController.changePassword);

router.use(tenantMiddleware)
router.use(verifyAuth)
router.get('/myProfile', employeeController.getProfile);


export default router;
