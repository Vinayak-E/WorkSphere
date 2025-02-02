import express from "express";
import { CompanyRepository } from "../repositories/company/companyRepository";
import { UserRepository } from "../repositories/user/userRepository";
import { JwtService } from "../services/jwt.service";
import { AuthenticationController } from "../controllers/company/auth.controller";

 import { AuthService } from "../services/company/authentication.service";
import { CompanyService } from "../services/company/company.service";
import { EmployeeRepository } from "../repositories/employee/employeeRepository";
import { tenantMiddleware } from "../middlewares/tenantMiddleware";
import { EmployeeService } from "../services/employee/employee.service";
import { AdminService } from "../services/admin/admin.service";
import { AdminRepository } from "../repositories/admin/adminRepository";

const router = express.Router();
const jwtService  = new JwtService()
const userRepository = new UserRepository();
const companyRepository = new CompanyRepository();
const employeeRepository = new EmployeeRepository()
const adminRepository = new AdminRepository()
const adminService = new AdminService(jwtService,adminRepository,companyRepository)


const employeeService = new EmployeeService(employeeRepository,userRepository)
const companyService = new CompanyService(employeeRepository,userRepository,companyRepository)
const authService =  new AuthService(companyRepository,userRepository,jwtService)
const authController = new AuthenticationController(authService,companyService,employeeService,adminService)


router.post("/signup", authController.signup);
router.post("/verifyOtp", authController.verifyOtp);
router.post("/login", authController.login);
router.post("/resendOtp", authController.resendOtp);
router.post('/forgotPassword',authController.forgotPassword)
router.post('/resetPassword', authController.resetPassword);
router.post('/google-login', authController.googleLogin);
router.post('/logout', authController.logout);
router.use(tenantMiddleware)

router.get('/verify-token',authController.verifyToken)
export default router;
