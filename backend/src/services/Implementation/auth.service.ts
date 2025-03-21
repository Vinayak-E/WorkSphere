import { redisClient } from '../../configs/redisClient';
import { IPayload } from '../../interfaces/IJwtService.types';
import {
  IVerifyOtpDto,
  ICompanyUser,
} from '../../interfaces/company/company.types';
import { sendEmail, sendResetEmail } from '../../utils/email';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import slugify from 'slugify';
import {
  generateCompanySlug,
  hashPassword,
  generateOTP,
  setRedisData,
  comparePasswords,
  checkCompanyPrefix,
} from '../../helpers/helperFunctions';
import { JwtService } from '../jwt.service';
import { injectable, inject } from 'tsyringe';
import { ISignup } from '../../interfaces/company/company.types';
import { IUserRepository } from '../../repositories/Interface/IUserRepository';
import { ICompanyRequestRepository } from '../../repositories/Interface/ICompanyRequestRepository';


@injectable()
export class AuthService {
    constructor(
        @inject('UserRepository') private userRepository: IUserRepository,
        @inject('CompanyRequestRepository') private companyRequestRepository: ICompanyRequestRepository,
        @inject('JwtService') private jwtService: JwtService,
      ) {}
    

  async signup(data: ISignup): Promise<string | boolean> {
    try {
      const {
        email,
        password,
        phone,
        businessRegNo,
        city,
        country,
        industry,
        state,
        zipcode,
      } = data;
      console.log('bussinessRegno at service',businessRegNo)
      const companyName = generateCompanySlug(data.companyName);
      const existingUser = await this.userRepository.findByEmailOrCompanyName(
        data.email,
        companyName
      );
      if (existingUser) return false;
      const hashedPassword = await hashPassword(password);
      const otp = await generateOTP();
      console.log('otp', otp);
      const redisKey = `user:register:${email}`;
      await setRedisData(
        redisKey,
        {
          email,
          password: hashedPassword,
          companyName,
          phone,
          otp,
          businessRegNo,
          city,
          country,
          industry,
          state,
          zipcode,
        },
        300
      );
      await sendEmail(email, 'Verify Your Email', `Your OTP is ${otp}`);
      return data.email;
    } catch (error) {
      throw error;
    }
  }

  async verifyOtp(data: IVerifyOtpDto): Promise<boolean> {
    try {
      const redisKey = `user:register:${data.email}`;
      const userData = await redisClient.get(redisKey);
      if (!userData) throw new Error('OTP expired or invalid');
      const parsedData = JSON.parse(userData);
      if (parsedData.otp !== data.otp) throw new Error('Invalid OTP');
      parsedData.role = 'COMPANY';
      await this.userRepository.createUser(parsedData);
      console.log('parsed data',parsedData)
      await this.companyRequestRepository.createTempCompany(parsedData);
      await redisClient.del(redisKey);
      return true;
    } catch (error) {
      throw error;
    }
  }

  async resendOtp(email: string): Promise<boolean> {
    try {
      const redisKey = `user:register:${email}`;
      const userData = await redisClient.get(redisKey);
      if (!userData) throw new Error('OTP expired or invalid');
      const parsedData = JSON.parse(userData);
      const newOtp = generateOTP();
      console.log('otp', newOtp);
      parsedData.otp = newOtp;
      await setRedisData(redisKey, parsedData, 300);
      await sendEmail(email, 'Resend OTP', `Your new OTP is ${newOtp}`);
      return true;
    } catch (error) {
      throw error;
    }
  }

  async verifyLogin(
    email: string,
    password: string,
    userType: string
  ): Promise<{
    user: ICompanyUser;
    refreshToken: string;
    accessToken: string;
    tenantId: string;
    forcePasswordChange?: boolean;
  } | null> {
    try {
      const user = await this.userRepository.findByEmail(email);
      if (!user) return null;

      if (!user.isActive) {
        throw new Error('You are blocked from this account');
      }

      const isPasswordValid = await comparePasswords(password, user.password);
      if (!isPasswordValid) return null;

      if (user.role === 'COMPANY') {
        if (user.isApproved === 'Pending' || user.isApproved === 'Rejected') {
          throw new Error(
            'Your request is still pending. You will receive a confirmation email.'
          );
        }
      }
      const tenantId = slugify(user.companyName).toUpperCase();
      const data = { tenantId, email: user.email, role: user.role };

      const [accessToken, refreshToken] = await Promise.all([
        this.jwtService.generateAccessToken(data),
        this.jwtService.generateRefreshToken(data),
      ]);

      if (userType === 'EMPLOYEE') {
        if (checkCompanyPrefix(user.companyName, password)) {
          return {
            user: data,
            accessToken,
            refreshToken,
            tenantId,
            forcePasswordChange: true,
          };
        }
      }
      return { user: data, accessToken, refreshToken, tenantId };
    } catch (error) {
      throw error;
    }
  }

  async sendResetLink(email: string) {
    try {
      if (!process.env.RESET_LINK_SECRET) return null;
      const existingUser = await this.userRepository.findByEmail(email);
      if (!existingUser) return false;

      const payload = { email };
      const resetToken = jwt.sign(payload, process.env.RESET_LINK_SECRET, {
        expiresIn: '1h',
      });
      const resetTokenExpiry = new Date(Date.now() + 3600 * 1000);
      await this.userRepository.storeResetToken(
        email,
        resetToken,
        resetTokenExpiry,
      );
      const frontendUrl = process.env.FRONTEND_URL || "http://localhost:5173"; 
      const resetLink = `${frontendUrl}/resetPassword?token=${resetToken}`; 
      await sendResetEmail(
        email,
        'Password Reset',
        `Click here to reset your password: ${resetLink}`
      );
      return true;
    } catch (error) {
      throw error;
    }
  }

  async resetPassword(email: string, password: string) {
    try {
      const hashedPassword = await bcrypt.hash(password, 10);
      await this.userRepository.resetPassword(email, hashedPassword);
    } catch (error) {
      throw new Error('Error reseting the password');
    }
  }

  async verifyAccessToken(token: string): Promise<IPayload> {
    try {
      const decoded = await this.jwtService.verifyJwtToken(token);

      if (!decoded) {
        throw new Error('Token verification failed');
      }
      return decoded;
    } catch (error) {
      throw error;
    }
  }

  async refreshTokens(refreshToken: string): Promise<{
    accessToken: string;
    decodedToken: IPayload;
  }> {
    try {
      const decoded = await this.jwtService.verifyJwtToken(refreshToken);
      if (!decoded) {
        throw new Error('Refresh token verification failed');
      }

      const newAccessToken = await this.jwtService.generateAccessToken({
        email: decoded.email,
        role: decoded.role,
        tenantId: decoded.tenantId,
      });

      return {
        accessToken: newAccessToken,
        decodedToken: decoded,
      };
    } catch (error) {
      throw error;
    }
  }

  
}
