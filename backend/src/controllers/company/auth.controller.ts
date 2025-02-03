import { Request, Response, NextFunction, RequestHandler } from "express";
import { IAuthService, ICompanyDocument } from "../../interfaces/company/company.types";
import jwt, { JwtPayload} from "jsonwebtoken";
import { firebaseAdmin } from "../../configs/firebase.config";
import { IPayload } from "../../interfaces/IJwtService.types";
import { IEmployee, IEmployeeService } from "../../interfaces/company/IEmployee.types";
import { CompanyService } from "../../services/company/company.service";
import { IAdminService } from "../../interfaces/admin/admin.types";
import { IUser } from "../../interfaces/IUser.types";


export class AuthenticationController {
  constructor(private readonly authService: IAuthService,
    private readonly companyService: CompanyService,
    private readonly  employeeService :IEmployeeService,
    private readonly  adminService :IAdminService
    
    ) {}

    signup: RequestHandler = async (req, res, next ) => {
      try {
            const data = req.body;
            const registeredMail = await this.authService.signup(data);
            if (registeredMail) {
            res.status(201).json({ success: true, registeredMail });
            } else {
            res.status(400).json({success: false , message: "This company is already registered!"});
            }
          } catch (error) {
            next(error);
          }
    };


    verifyOtp: RequestHandler = async (req, res, next ) => {
      try {
            const verified = await this.authService.verifyOtp(req.body);
            if (!verified) {
              res.status(400).json({ message: "Wrong OTP!" });
            }
            res.status(200).json({ message: "OTP verification successful!" });
          } catch (error) {
            next(error)
          }
    };


    resendOtp: RequestHandler = async (req, res, next ) => {
      try {
            const { email } = req.body;
            if (!email) res.status(400).json({ message: "Email is required" });
            const success = await this.authService.resendOtp(email);
            if (!success) res.status(400).json({ message: "Failed to resend OTP" });
            res.json({ success: true, message: "OTP resent successfully" });
          } catch (error) {
            next(error)
          }
    };



    login: RequestHandler = async ( req , res, next ) => {
      try {
        const { email, password, userType } = req.body;
        const response = await this.authService.verifyLogin( email, password, userType );

        if (!response) {
          res.status(400).json({ message: "Invalid email or password!" });
          return;
        }

        if (response.refreshToken) {
          res.cookie("refreshToken", response.refreshToken, {
            httpOnly: true,
            sameSite: "lax",
            maxAge: 7 * 24 * 60 * 60 * 1000,
          });
        }

        if (response.accessToken) {
          res.cookie("accessToken", response.accessToken, {
            httpOnly: true,
            sameSite: "lax",
            secure: process.env.NODE_ENV === "production",
            maxAge: 15 * 60 * 1000,
          });
        }
        res.status(200).json({
          success: true,
          email : response.user.email,
          accessToken: response.accessToken,
          tenantId: response.tenantId,
          role: response.user.role,
          forcePasswordChange: response.forcePasswordChange || false,
        });
      } catch (error) {
        next(error);
      }
    };

  forgotPassword: RequestHandler = async ( req, res, next ) => {
    try {
      const { email } = req.body;
      const sendResetLink = await this.authService.sendResetLink(email);
      if (sendResetLink === false) {
        res.status(400).json({ message: "The email is not registered!" });
      } else if (sendResetLink) {
        res.status(200).json({ message: "The otp has sent to your email" });
      }
    } catch (error) {
      next (error)
    }
  };

  resetPassword: RequestHandler = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    const { token, newPassword } = req.body;
    try {
      interface TokenPayload extends JwtPayload {
        email: string;
      }
      const decoded = jwt.verify(
        token,
        process.env.RESET_LINK_SECRET as string
      ) as TokenPayload;
      const { email } = decoded;
      await this.authService.resetPassword(email, newPassword);
      res.status(200).json({ message: "Token is valid", decoded });
    } catch (error) {
      res.status(400).json({ message: "Invalid or expired token" });
    }
  };

  verifyToken: RequestHandler = async (req, res, next) => {
    try {
      const accessToken = req.cookies.accessToken;
      const refreshToken = req.cookies.refreshToken;
  
      if (!accessToken && !refreshToken) {
        res.status(401).json({ success: false, message: "No tokens" });
        return; // Explicit return without value
      }

      const tenantConnection = req.tenantConnection;
          
      if (!tenantConnection) {
           res.status(500).json({ 
          success: false,
          message: "Tenant connection not established" 
        });
        return
      }
  
      let decodedToken: IPayload | null = null;
      let newAccessToken: string | null = null;
      
      if (accessToken) {
        try {
          decodedToken = await this.authService.verifyAccessToken(accessToken);
        } catch (error) {
          if (!refreshToken) {
            res.status(401).json({ success: false, message: "Invalid token" });
            return; 
          }
        }
      }
  
      if (!decodedToken && refreshToken) {
        try {
          const refreshResult = await this.authService.refreshTokens(refreshToken);
          newAccessToken = refreshResult.accessToken;
          decodedToken = refreshResult.decodedToken;
  
          res.cookie('accessToken', newAccessToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
            maxAge: 15 * 60 * 1000
          });
        } catch (error) {
          res.status(401).json({ success: false, message: "Invalid refresh" });
          return; 
        }
      }
  
      if (!decodedToken) {
        res.status(401).json({ success: false, message: "Auth failed" });
        return; 
      }
     
  
      try {
        let userData: ICompanyDocument | IEmployee | IUser |null;
        switch (decodedToken.role) {
          case 'COMPANY':
            userData = await this.companyService.getCompanyByEmail(decodedToken.email,tenantConnection);
            break;
          case 'EMPLOYEE':
            userData = await this.employeeService.getEmployeeProfile(tenantConnection,decodedToken.email);
            break;
            case 'MANAGER':
              userData = await this.employeeService.getEmployeeProfile(tenantConnection,decodedToken.email);
              break;
              case 'ADMIN':
                userData = await this.adminService.getProfile(decodedToken.email);
                break;
          default:
            res.status(403).json({ success: false, message: "Invalid role" });
            return; 
        }
  
        if (!userData) {
          res.status(404).json({ success: false, message: "Not found" });
          return; 
        }
  
        res.status(200).json({
          success: true,
          email: decodedToken.email,
          role: decodedToken.role,
          tenantId: decodedToken.tenantId,
          userData
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
      
      res.status(200).json({ 
        success: true, 
        message: "Logged out successfully" 
      });
    } catch (error) {
      next(error);
    }
  };


  googleLogin: RequestHandler = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    const { idToken } = req.body;
    try {
      const decodedToken = await firebaseAdmin.auth().verifyIdToken(idToken);
      const user = await this.authService.findOrCreateCompany(decodedToken);
      if (
        !process.env.ACCESS_TOKEN_SECRET ||
        !process.env.REFRESH_TOKEN_SECRET
      ) {
        throw new Error("JWT secrets are not configured");
      }
      const accessToken = jwt.sign(
        { userId: user.uid },
        process.env.ACCESS_TOKEN_SECRET,
        { expiresIn: "20s" }
      );
      const refreshToken = jwt.sign(
        { userId: user.uid },
        process.env.REFRESH_TOKEN_SECRET,
        { expiresIn: "1h" }
      );

      res.status(200).json({
        success: true,
        accessToken,
        refreshToken,
        user: {
          email: user.email,
          isAdmin: false,
        },
      });
    } catch (error: any) {
      if (error.code === "auth/invalid-id-token") {
        res.status(400).json({ message: "Invalid Google ID Token" });
      } else {
        res.status(500).json({
          message: "Something went wrong during login",
          error: error.message,
        });
      }
    }
  };
}