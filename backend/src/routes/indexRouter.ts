import express from "express";
import { CompanyRepository } from "../repositories/company/companyRepository";
import { UserRepository } from "../repositories/user/userRepository";
import { JwtService } from "../services/jwt.service";
import { AuthenticationController } from "../controllers/Implementation/company/auth.controller";

 import { AuthService } from "../services/Implementation/authentication.service";

const router = express.Router();
const jwtService  = new JwtService()
const userRepository = new UserRepository();
const companyRepository = new CompanyRepository();
const authService =  new AuthService(companyRepository,userRepository,jwtService)
const authController = new AuthenticationController(authService)


router.post("/signup", authController.signup);
router.post("/verifyOtp", authController.verifyOtp);
router.post("/login", authController.login);
router.post("/resendOtp", authController.resendOtp);
router.post('/forgotPassword',authController.forgotPassword)
router.post('/resetPassword', authController.resetPassword);
router.post('/google-login', authController.googleLogin);


router.get('/verify-token',authController.verifyToken)
export default router;
