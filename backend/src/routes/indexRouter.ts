import express from "express";
import { CompanyAuthController } from "../controllers/company/companyAuthController";
import { CompanyRepository } from "../repositories/company/companyRepository";
import { CompanyService } from "../services/company/company.service";
import { UserRepository } from "../repositories/user/userRepository";
import { JwtService } from "../services/jwt.service";


const router = express.Router();
const jwtService  = new JwtService()
const userRepository = new UserRepository();
const companyRepository = new CompanyRepository();
const companyService = new CompanyService(companyRepository,userRepository,jwtService);
const companyController = new CompanyAuthController(companyService);

router.post("/signup", companyController.signup);
router.post("/login", companyController.login);
router.post("/verifyOtp", companyController.verifyOtp);
router.post("/resendOtp", companyController.resendOtp);
router.post('/forgotPassword',companyController.forgotPassword)
router.post('/resetPassword', companyController.resetPassword);
router.post('/google-login', companyController.googleLogin);


router.get('/verify-token',companyController.verifyToken)
export default router;
