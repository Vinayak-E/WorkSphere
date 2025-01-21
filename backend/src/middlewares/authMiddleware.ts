import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import mongoose from "mongoose";

interface JwtPayload {
  userId: string;
  role: string;
  tenantId: string;
}

declare global {
  namespace Express {
    interface Request {
      user?: JwtPayload;
      isTenantConnected?: boolean;
      tenantId?: string;
      tenantConnection?: mongoose.Connection;
    }
  }
}


export const verifyAuth = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const token = req.cookies?.accessToken;
    const refreshToken = req.cookies?.refreshToken;

    if (!token && !refreshToken) {
       res.status(401).json({ message: "Authentication token missing" });
    }

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRETKEY!) as JwtPayload;
      req.user = decoded;
      next();
    } catch (err) {
      if (!refreshToken) {
         res.status(401).json({ message: "Session expired. Please log in again." });
      }

      try {
        const refreshDecoded = jwt.verify(refreshToken, process.env.JWT_SECRETKEY!) as JwtPayload;
        const newAccessToken = jwt.sign(
          { 
            userId: refreshDecoded.userId,
            role: refreshDecoded.role,
            tenantId: refreshDecoded.tenantId 
          }, 
          process.env.JWT_SECRETKEY!, 
          { expiresIn: "15m" }
        );

        res.cookie("accessToken", newAccessToken, {
          httpOnly: true,
          secure: process.env.NODE_ENV === "production",
          sameSite: "strict",
        });

        req.user = refreshDecoded;
        next();
      } catch (refreshErr) {
         res.status(403).json({ message: "Session expired. Please log in again." });
      }
    }
  } catch (error) {
    console.error("Error in auth middleware:", error);
     res.status(500).json({ message: "Internal server error" });
  }
};
