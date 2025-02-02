import express from "express";
import { CompanyRepository } from "../../repositories/company/companyRepository";
import { UserRepository } from "../../repositories/user/userRepository";
import { JwtService } from "../../services/jwt.service";
import { EmployeeController } from "../../controllers/employee/employee.controller";
import { AuthService } from "../../services/company/authentication.service";
import { tenantMiddleware } from "../../middlewares/tenantMiddleware";
import { verifyAuth } from "../../middlewares/authMiddleware";
import { EmployeeRepository } from "../../repositories/employee/employeeRepository";
import { CompanyService } from "../../services/company/company.service";
import { EmployeeService } from "../../services/employee/employee.service";
const router = express.Router();
const jwtService  = new JwtService()
const userRepository = new UserRepository();
const companyRepository = new CompanyRepository();
const employeeRepository = new EmployeeRepository()
const employeeService = new EmployeeService(employeeRepository,userRepository)
const companyService = new CompanyService(employeeRepository,userRepository,companyRepository)
const authService = new AuthService(companyRepository,userRepository,jwtService);
const employeeController = new EmployeeController(authService,employeeService);



router.post('/changePassword', employeeController.changePassword);

router.use(tenantMiddleware)
router.use(verifyAuth)
router.get('/myProfile', employeeController.getProfile);
router.patch('/updateProfile/:id',employeeController.updateProfile);

router.post('/attendance/check-in',employeeController.checkIn)
router.post('/attendance/check-out',employeeController.checkOut)
router.get('/attendance/status/:id',employeeController.getAttendanceStatus)

router.get('/leaves', employeeController.getLeaves);
router.post('/leaves', employeeController.applyLeave);
export default router;
