import { Request, Response, NextFunction, RequestHandler } from "express";
import { ICompanyService } from "../../interfaces/company/company.types";
import jwt, { JwtPayload} from "jsonwebtoken";
import { firebaseAdmin } from "../../configs/firebase.config";


export class CompanyAuthController {
  constructor(private readonly companyService: ICompanyService) {}

  signup: RequestHandler = async ( req: Request, res: Response,next: NextFunction) => {
    try {
      const data = req.body;
      const registeredMail = await this.companyService.signup(data);

      if (registeredMail) {
        res.status(201).json({ success: true, registeredMail });
      } else {
        res.status(400).json({
          success: false,
          message: "This company is already registered!",
        });
      }
    } catch (error) {
      next(error);
    }
  };

  verifyOtp: RequestHandler = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const verified = await this.companyService.verifyOtp(req.body);
      if (!verified) {
        res.status(400).json({ message: "Wrong OTP!" });
        return;
      }

      res.status(200).json({ message: "OTP verification successful!" });
    } catch (error) {
      console.error("Error verifying the OTP:", error);
      res.status(500).json({ message: "Error verifying the OTP", error });
    }
  };

  resendOtp: RequestHandler = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const { email } = req.body;
      if (!email) res.status(400).json({ message: "Email is required" });
  
      const success = await this.companyService.resendOtp(email);
      if (!success)  res.status(400).json({ message: "Failed to resend OTP" });
  
      res.json({ success: true, message: "OTP resent successfully" });
    } catch (error) {
      console.error("Error in resendOtpController:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  };

  login: RequestHandler = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const { email, password,userType } = req.body;
     
      const response = await this.companyService.verifyLogin(email, password,userType);

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
            accessToken: response.accessToken,
            tenantId: response.tenantId,
            role: response.user.role,
            forcePasswordChange: response.forcePasswordChange || false
          });
    } catch (error) {
      next(error)
    }
  };

 

  forgotPassword: RequestHandler = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const { email } = req.body;
      console.log("forgetPassreq", req.body);

      const sendResetLink = await this.companyService.sendResetLink(email);
      if (sendResetLink === false) {
        console.log(sendResetLink);
        res.status(400).json({ message: "The email is not registered!" });
      } else if (sendResetLink) {
        res.status(200).json({ message: "The otp has sent to your email" });
      }
    } catch (error) {
      res.status(500).json({ message: "Something went wrong!" });
      console.log(
        "Something went wrong during resetting the forgot password",
        error
      );
    }
  };

  resetPassword: RequestHandler = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    const { token, newPassword } = req.body;
    console.log("token & pass: ", token, " ", newPassword);
    try {
      interface TokenPayload extends JwtPayload {
        email: string;
      }
      const decoded = jwt.verify(
        token,
        process.env.RESET_LINK_SECRET as string
      ) as TokenPayload;
      console.log("decoded: ", decoded);
      const { email } = decoded;
      await this.companyService.resetPassword(email, newPassword);
      res.status(200).json({ message: "Token is valid", decoded });
    } catch (error) {
      res.status(400).json({ message: "Invalid or expired token" });
    }
  };




  verifyToken: RequestHandler = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const token = req.cookies.accessToken;
      
      if (!token) {
          res.status(401).json({ 
          success: false, 
          message: "No authentication token provided" 
        });
        return
      }
        const decoded = await this.companyService.verifyAccessToken(token);
        
        if (!decoded) {
           res.status(401).json({ 
            success: false, 
            message: "Invalid token" 
          });
          return
        }
        console.log('decoded token',decoded)

         res.status(200).json({
          success: true,
          email: decoded.email,
          role: decoded.role,
          tenantId: decoded.tenantId
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
      const user = await this.companyService.findOrCreateCompany(decodedToken);
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
        console.log("Invalid Google ID Token", error);
      } else {
        res.status(500).json({
          message: "Something went wrong during login",
          error: error.message,
        });
        console.log("Something went wrong during login", error);
      }
    }
  };


  
}