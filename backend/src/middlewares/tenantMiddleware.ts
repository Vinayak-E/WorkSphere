import jwt from "jsonwebtoken";
import { Request, Response, NextFunction } from "express";
import { connectTenantDB } from "../configs/db.config";
import mongoose from "mongoose";

const jwtSecret = process.env.JWT_SECRETKEY || "your_jwt_secret";
const refreshSecret = process.env.JWT_SECRETKEY || "your_refresh_secret";

declare global {
  namespace Express {
    interface Request {
      tenantConnection?: mongoose.Connection;
    }
  }
}

export const tenantMiddleware = async (req: Request, res: Response, next: NextFunction) => {
  try {
    let token = req.cookies?.accessToken;
    const refreshToken = req.cookies?.refreshToken;

    if (!token) {
      res.status(401).json({ message: "Authentication token missing" });
      return; // Ensure request does not proceed further
    }

    try {
      // Try verifying the access token
      const decoded = jwt.verify(token, jwtSecret) as { tenantId: string };

      if (!decoded || !decoded.tenantId) {
        res.status(403).json({ message: "Invalid token or tenantId not found" });
        return;
      }

      const { tenantId } = decoded;

      if (!req.tenantConnection) {
        req.tenantConnection = await connectTenantDB(tenantId);
      }

      return next(); // Move to the next middleware/route
    } catch (err) {
      console.log("Access token expired. Checking refresh token...");

      if (!refreshToken) {
        res.status(401).json({ message: "Session expired. Please log in again." });
        return;
      }

      try {
        // Verify the refresh token
        const refreshDecoded = jwt.verify(refreshToken, refreshSecret) as { tenantId: string };

        if (!refreshDecoded || !refreshDecoded.tenantId) {
          res.status(403).json({ message: "Invalid refresh token" });
          return;
        }

        const { tenantId } = refreshDecoded;

        // Generate a new access token
        const newAccessToken = jwt.sign({ tenantId }, jwtSecret, { expiresIn: "15m" });

        // Set the new access token in cookies
        res.cookie("accessToken", newAccessToken, {
          httpOnly: true,
          secure: process.env.NODE_ENV === "production",
          sameSite: "strict",
        });

        console.log("New access token generated and set in cookies");

        // Reconnect to the tenant database
        req.tenantConnection = await connectTenantDB(tenantId);

        return next(); // Proceed after refresh token validation
      } catch (refreshErr) {
        console.log("Invalid refresh token:", refreshErr);
        res.status(403).json({ message: "Session expired. Please log in again." });
        return;
      }
    }
  } catch (error) {
    console.error("Error in tenant middleware:", error);
    res.status(500).json({ message: "Internal server error" });
    return;
  }
};
