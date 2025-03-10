import 'reflect-metadata'
import express from 'express';
import { container } from 'tsyringe';
import { tenantMiddleware } from '../middlewares/tenantMiddleware';
import { AuthController } from '../controllers/Implementation/auth.controller';

const router = express.Router();
const authController = container.resolve<AuthController>('AuthController');


router.post('/signup', authController.signup);
router.post('/verifyOtp', authController.verifyOtp);
router.post('/login', authController.login);
router.post('/resendOtp', authController.resendOtp);
router.post('/forgotPassword', authController.forgotPassword);
router.post('/resetPassword', authController.resetPassword);
router.post('/logout', authController.logout);
router.use(tenantMiddleware);

router.get('/verify-token', authController.verifyToken);
export default router;
