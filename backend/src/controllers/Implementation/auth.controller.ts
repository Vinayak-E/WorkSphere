import { injectable, inject } from 'tsyringe';
import jwt, { JwtPayload } from 'jsonwebtoken';
import { Messages } from '../../constants/messages';
import { HttpStatus } from '../../constants/httpStatus';
import { AuthService } from '../../services/Implementation/auth.service';
import { Request, Response, NextFunction, RequestHandler } from 'express';
import { AdminService } from '../../services/Implementation/admin.service';
import { CompanyService } from '../../services/Implementation/company.service';
import { EmployeeService } from '../../services/Implementation/employee.service';
import { IPayload } from '../../interfaces/IJwtService.types';
import { IEmployee } from '../../interfaces/company/IEmployee.types';
import { ICompanyDocument } from '../../interfaces/company/company.types';
import { IUser } from '../../interfaces/IUser.types';

@injectable()
export class AuthController {
  constructor(
    @inject('AuthService') private authService: AuthService,
    @inject('EmployeeService') private employeeService: EmployeeService,
    @inject('CompanyService') private companyService: CompanyService,
    @inject('AdminService') private adminService: AdminService
  ) {}

  signup: RequestHandler = async (req, res, next) => {
    try {
      const data = req.body;
      const registeredMail = await this.authService.signup(data);

      if (registeredMail) {
        res.status(HttpStatus.CREATED).json({
          success: true,
          registeredMail,
        });
      } else {
        res.status(HttpStatus.BAD_REQUEST).json({
          success: false,
          message: Messages.COMPANY_ALREADY_REGISTERED,
        });
      }
    } catch (error) {
      next(error);
    }
  };

  verifyOtp: RequestHandler = async (req, res, next) => {
    try {
      const verified = await this.authService.verifyOtp(req.body);
      if (!verified) {
        res.status(HttpStatus.BAD_REQUEST).json({
          message: Messages.WRONG_OTP,
        });
        return;
      }
      res.status(HttpStatus.OK).json({
        message: Messages.OTP_VERIFICATION_SUCCESS,
      });
    } catch (error) {
      next(error);
    }
  };

  resendOtp: RequestHandler = async (req, res, next) => {
    try {
      const { email } = req.body;
      if (!email) {
        res
          .status(HttpStatus.BAD_REQUEST)
          .json({ message: Messages.EMAIL_REQUIRED });
        return;
      }
      const success = await this.authService.resendOtp(email);
      if (!success) {
        res
          .status(HttpStatus.BAD_REQUEST)
          .json({ message: Messages.OTP_RESEND_FAILED });
        return;
      }
      res.json({ success: true, message: Messages.OTP_RESEND_SUCCESS });
    } catch (error) {
      next(error);
    }
  };

  login: RequestHandler = async (req, res, next) => {
    try {
      const { email, password, userType } = req.body;
      const response = await this.authService.verifyLogin(
        email,
        password,
        userType
      );

      if (!response) {
        res
          .status(HttpStatus.BAD_REQUEST)
          .json({ message: Messages.INVALID_CREDENTIALS });
        return;
      }

      if (response.refreshToken) {
        res.cookie('refreshToken', response.refreshToken, {
          httpOnly: true,
          sameSite: 'lax',
          maxAge: 7 * 24 * 60 * 60 * 1000,
        });
      }

      if (response.accessToken) {
        res.cookie('accessToken', response.accessToken, {
          httpOnly: true,
          sameSite: 'lax',
          secure: process.env.NODE_ENV === 'production',
          maxAge: 15 * 60 * 1000,
        });
      }

      res.status(HttpStatus.OK).json({
        success: true,
        email: response.user.email,
        accessToken: response.accessToken,
        tenantId: response.tenantId,
        role: response.user.role,
        forcePasswordChange: response.forcePasswordChange || false,
      });
    } catch (error) {
      next(error);
    }
  };

  forgotPassword: RequestHandler = async (req, res, next) => {
    try {
      const { email } = req.body;
      const sendResetLink = await this.authService.sendResetLink(email);
      if (!sendResetLink) {
        res
          .status(HttpStatus.BAD_REQUEST)
          .json({ message: Messages.EMAIL_NOT_REGISTERED });
      } else {
        res.status(HttpStatus.OK).json({ message: Messages.OTP_SENT_SUCCESS });
      }
    } catch (error) {
      next(error);
    }
  };

  resetPassword: RequestHandler = async (req, res, next) => {
    try {
      const { token, newPassword } = req.body;
      interface TokenPayload extends JwtPayload {
        email: string;
      }

      const decoded = jwt.verify(
        token,
        process.env.RESET_LINK_SECRET as string
      ) as TokenPayload;
      await this.authService.resetPassword(decoded.email, newPassword);

      res.status(HttpStatus.OK).json({ message: Messages.TOKEN_VALID });
    } catch (error) {
      res
        .status(HttpStatus.BAD_REQUEST)
        .json({ message: Messages.INVALID_TOKEN });
    }
  };

  verifyToken: RequestHandler = async (req, res, next) => {
    try {
      const accessToken = req.cookies.accessToken;
      const refreshToken = req.cookies.refreshToken;

      if (!accessToken && !refreshToken) {
        res
          .status(HttpStatus.UNAUTHORIZED)
          .json({ success: false, message: Messages.NO_TOKENS });
        return;
      }

      const tenantConnection = req.tenantConnection;
      if (!tenantConnection) {
        res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
          success: false,
          message: Messages.TENANT_CONNECTION_ERROR,
        });
        return;
      }

      let decodedToken: IPayload | null = null;
      let newAccessToken: string | null = null;

      if (accessToken) {
        try {
          decodedToken = await this.authService.verifyAccessToken(accessToken);
        } catch {
          if (!refreshToken) {
            res
              .status(HttpStatus.UNAUTHORIZED)
              .json({ success: false, message: Messages.INVALID_TOKEN });
            return;
          }
        }
      }

      if (!decodedToken && refreshToken) {
        try {
          const refreshResult =
            await this.authService.refreshTokens(refreshToken);
          newAccessToken = refreshResult.accessToken;
          decodedToken = refreshResult.decodedToken;

          res.cookie('accessToken', newAccessToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
            maxAge: 15 * 60 * 1000,
          });
        } catch {
          res
            .status(HttpStatus.UNAUTHORIZED)
            .json({ success: false, message: Messages.INVALID_REFRESH });
          return;
        }
      }

      if (!decodedToken) {
        res
          .status(HttpStatus.UNAUTHORIZED)
          .json({ success: false, message: Messages.AUTH_FAILED });
        return;
      }

      try {
        let userData: ICompanyDocument | IEmployee | IUser | null;
        
        switch (decodedToken.role) {
          case 'COMPANY':
            userData = await this.companyService.getCompanyByEmail(
              decodedToken.email,
              tenantConnection
            );
            break;
          case 'EMPLOYEE':
            userData = await this.employeeService.getEmployeeProfile(
              tenantConnection,
              decodedToken.email
            );
            break;
          case 'MANAGER':
            userData = await this.employeeService.getEmployeeProfile(
              tenantConnection,
              decodedToken.email
            );
            break;
          case 'ADMIN':
            userData = await this.adminService.getProfile(decodedToken.email);
            break;
          default:
            res.status(403).json({ success: false, message: 'Invalid role' });
            return;
        }

        if (!userData) {
          res.status(404).json({ success: false, message: 'Not found' });
          return;
        }

        res.status(200).json({
          success: true,
          email: decodedToken.email,
          role: decodedToken.role,
          tenantId: decodedToken.tenantId,
          userData,
        });
        return;
      } catch (error) {
        next(error);
      }
    } catch (error) {
      next(error);
    }
  };

  logout: RequestHandler = async (req, res, next) => {
    try {
      res.clearCookie('accessToken');
      res.clearCookie('refreshToken');

      res.status(HttpStatus.OK).json({
        success: true,
        message: Messages.LOGOUT_SUCCESS,
      });
    } catch (error) {
      next(error);
    }
  };
}
