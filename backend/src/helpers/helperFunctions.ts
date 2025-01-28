import slugify from "slugify";
import bcrypt from "bcryptjs"
import { redisClient } from "../configs/redisClient";

export const generateCompanySlug = (companyName:string) => {
  if (!companyName || companyName.trim() === "") {
    throw new Error("Company name is required");
  }
  return slugify(companyName).toUpperCase();
};



export const hashPassword = async (password: string): Promise<string> => {
    if (!password || password.trim() === "") {
      throw new Error("Password is required");
    }
    return await bcrypt.hash(password, 10);
  };



export async function comparePasswords(providedPassword: string, hashedPassword: string): Promise<boolean> {
  try {
      const isMatch = await bcrypt.compare(providedPassword, hashedPassword);
      return isMatch;
   } catch (error) {
      console.error('Error comparing passwords:', error);
      throw new Error('Password comparison failed');
  }
}


export const generateOTP = (): string => {
    return Math.floor(100000 + Math.random() * 900000).toString();
 };



export const setRedisData = async (key: string, data: any, expiration: number) => {
  await redisClient.set(key, JSON.stringify(data), { EX: expiration });
};


export const generateCompanyBasedPassword = (companyName: string, length: number = 12): string => {
  let prefix = companyName.slice(0, 4).toUpperCase();
  if (prefix.length < 4) {
    prefix = prefix.padEnd(4, "X"); 
  }
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789@#$%&*!?";

  
  let randomPart = "";
  for (let i = 0; i < length - 4; i++) {
    randomPart += chars.charAt(Math.floor(Math.random() * chars.length));
  }

  return prefix + randomPart;
}


export function checkCompanyPrefix(companyName: string, password: string): boolean {
  const companyPrefix = companyName.slice(0, 4)
  return password.startsWith(companyPrefix);
}
export function generateDepartmentId(): string {
  const randomNumber = Math.floor(Math.random() * 1000000); 
  const departmentId = `DEPT${randomNumber.toString().padStart(6, '0')}`;
  return departmentId;
}

export function generateEmployeeId(): string {
  const randomDigits = Math.floor(100000 + Math.random() * 900000);
  return `EMP${randomDigits}`;
}
