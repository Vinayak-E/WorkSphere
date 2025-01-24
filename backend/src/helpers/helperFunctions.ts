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


export const generateOTP = (): string => {
    return Math.floor(100000 + Math.random() * 900000).toString();
 };



export const setRedisData = async (key: string, data: any, expiration: number) => {
  await redisClient.set(key, JSON.stringify(data), { EX: expiration });
};