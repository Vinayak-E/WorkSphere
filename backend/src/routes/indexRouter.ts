import express from "express";
import { CompanyAuthController } from "../controllers/Implementation/company/authentication.controller";
import { CompanyRepository } from "../repositories/company/companyRepository";
import { CompanyService } from "../services/company/company.service";
import { UserRepository } from "../repositories/user/userRepository";
import { JwtService } from "../services/jwt.service";
import { AuthenticationController } from "../controllers/Implementation/company/auth.controller";

 import { AuthService } from "../services/Implementation/authentication.service";

const router = express.Router();
const jwtService  = new JwtService()
const userRepository = new UserRepository();
const companyRepository = new CompanyRepository();
const authService =  new AuthService(companyRepository,userRepository,jwtService)
const companyService = new CompanyService(companyRepository,userRepository,jwtService);
const authController = new AuthenticationController(authService)
const companyController = new CompanyAuthController(companyService);

router.post("/signup", authController.signup);
router.post("/verifyOtp", authController.verifyOtp);
router.post("/login", companyController.login);
router.post("/resendOtp", companyController.resendOtp);
router.post('/forgotPassword',companyController.forgotPassword)
router.post('/resetPassword', companyController.resetPassword);
router.post('/google-login', companyController.googleLogin);


router.get('/verify-token',companyController.verifyToken)
export default router;
