  import {redisClient } from "../../configs/redisClient";
import { IJwtService } from "../../interfaces/IJwtService.types";
  import { IUserRepository } from "../../interfaces/IUser.types";
  import {ICompanySignup,IVerifyOtpDto,ICompanyService,ICompanyRepository,ICompanyUser} from "../../interfaces/company/company.types";
  import { sendEmail,sendResetEmail} from "../../utils/email"; 
  import {generateOTP} from "../../utils/otp"
  import bcrypt from "bcryptjs"
  import jwt from "jsonwebtoken";
  import slugify from "slugify";  


  export class CompanyService implements ICompanyService {

    constructor(
      private readonly companyRepository: ICompanyRepository,
      private readonly userRepository :IUserRepository,
      private readonly jwtService :IJwtService
  ) {}
  
  async signup(data: ICompanySignup): Promise<string | boolean | null> {
    try {
      const {  email, password, phone } = data;
      const Name = data.companyName
      const companyName = slugify(Name || "").toUpperCase();
      const existingUser = await this.userRepository.findByEmailOrCompanyName(data.email, companyName);
      if(existingUser)return false

      const hashPassword = await bcrypt.hash(password, 10);
      const otp = await this.generateOtp(email);
      console.log('otp', otp);
      const redisKey = `user:register:${email}`;

      await redisClient.set(
        redisKey,
        JSON.stringify({ email, password: hashPassword, companyName, phone, otp }),
        { EX: 300 }
      );
      return data.email;
    } catch (error) {
      console.error("Error registering company:", error);
      return null;
    }
  }

  async verifyOtp(data: IVerifyOtpDto): Promise<boolean> {
    const redisKey = `user:register:${data.email}`;
    const userData = await redisClient.get(redisKey);
    if (!userData) throw new Error("OTP expired or invalid");
    const parsedData = JSON.parse(userData);

    if (parsedData.otp !== data.otp) throw new Error("Invalid OTP");
       
    parsedData.role ='COMPANY'

    const user =  await this.userRepository.createUser(parsedData);

    const tenantId = slugify(parsedData.companyName).toUpperCase()

    await this.companyRepository.createTenantCompany(tenantId , parsedData);

    await redisClient.del(redisKey);

    return true;
  }


    async generateOtp(email: string): Promise<any> {
      try {
          const otp = generateOTP();
          await sendEmail( email,"Verify Your Email", `Your OTP is ${otp}`)
          return otp;
      } catch (error) {
          console.error('Error generating OTP:', error);
          return null;
      }
  }


  async resendOtp(email: string): Promise<boolean> {
    try {
      const redisKey = `user:register:${email}`;
      const userData = await redisClient.get(redisKey);
  
      if (!userData) throw new Error("OTP expired or invalid");
  
      const parsedData = JSON.parse(userData);
  
 
      const newOtp = generateOTP();
       console.log('otp',newOtp);
       
      parsedData.otp = newOtp;
      await redisClient.set(redisKey, JSON.stringify(parsedData), { EX: 300 });
  
      await sendEmail(email, "Resend OTP", `Your new OTP is ${newOtp}`);
  
      return true;
    } catch (error) {
      console.error("Error resending OTP:", error);
      return false;
    }
  }


  
  
  
    
  async verifyLogin(email: string, password: string): Promise<{ user: ICompanyUser,refreshToken: string;
    accessToken: string; tenantId: string } | null> {
    try {
        const user = await this.userRepository.findByEmail(email);
        if (!user) return null;

       console.log(`user data verifylogin ${user}`);
       
        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) return null;

        // Generate tenantId from company name
        const tenantId = slugify(user.companyName).toUpperCase()

          const data = {
           tenantId,
          email: user.email,
          role: user.role,
        };
  
        const [accessToken, refreshToken] = await Promise.all([
          this.jwtService.generateAccessToken(data),
          this.jwtService.generateRefreshToken(data)
        ]);
  
        return {user:data, accessToken, refreshToken,tenantId };
    } catch (error) {
        console.error('Error verifying login:', error);
        throw new Error('Login failed');
    }
}


async verifyRefreshToken(refreshToken: string): Promise<string | null> {
    try {
        const decoded = jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET!);
        return (decoded as any).userId;
    } catch (error) {
        console.error('Error verifying refresh token:', error);
        return null;
    }
}



async generateAccessToken(userId: string): Promise<string> {
    try {
        return jwt.sign({ userId }, process.env.ACCESS_TOKEN_SECRET!, { expiresIn: '20s' });
    } catch (error) {
        console.error('Error generating access token:', error);
        throw new Error('Failed to generate access token');
    }
}


async sendResetLink(email: string) {
  try {
      if (!process.env.RESET_LINK_SECRET) {
          console.error('RESET_LINK_SECRET is not configured');
          return null;
      }

      const existingUser = await this.userRepository.findByEmail(email);
      if (!existingUser) {
          return false;
      }
        
         
      const payload = { email };
      const resetToken = jwt.sign(
          payload, 
          process.env.RESET_LINK_SECRET, 
          { expiresIn: '1h' }
      );
      console.log('reset token founds',resetToken)

      const tokenExpiry = new Date(Date.now() + 3600 * 1000);
      await this.companyRepository.storeResetToken(email, resetToken, tokenExpiry);

      const resetLink = `http://localhost:5173/resetPassword?token=${resetToken}`;
      await sendResetEmail(
          email, 
          "Password Reset", 
          `Click here to reset your password: ${resetLink}`
      );

      console.log("Reset link sent:", resetLink);
      return true;
  } catch (error) {
      console.error('Error sending reset link to the mail:', error);
      return null;
  }
}

async resetPassword (email: string, password :string) {
  try {
      const hashedPassword = await bcrypt.hash(password, 10);
      await this.userRepository.resetPassword(email, hashedPassword);
  } catch (error) {
      console.error('Error reseting the password:', error);
      throw new Error('Error reseting the password');
  }
}

async findOrCreateCompany(profile: any): Promise<any> {

  const email = profile.email;
  const existingUser = await this.companyRepository.findByEmail(email);
  
  if (existingUser) {
    return existingUser;
  }

  const newUser = {
    companyName:null,
    email,
    phone :null,
    googleId: profile.uid,
    password: profile.password || null,
  };


}
   
  }
  