import jwt from 'jsonwebtoken';
import { Request, Response, NextFunction } from 'express';
import { connectTenantDB } from '../configs/db.config';
import mongoose from 'mongoose';

const jwtSecret = process.env.JWT_SECRETKEY || 'secret-code-forjwt';
const refreshSecret = process.env.JWT_SECRETKEY || 'secret-code-forjwt';

declare global {
  namespace Express {
    interface Request {
      isTenantConnected?: boolean;
      tenantId?: string;
      tenantConnection?: mongoose.Connection;
    }
  }
}

export const tenantMiddleware = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    let token = req.cookies?.accessToken;
    const refreshToken = req.cookies?.refreshToken;

    if (!token && !refreshToken) {
      res.status(401).json({ message: 'Authentication token missing' });
      return;
    }

    try {
      const decoded = jwt.verify(token, jwtSecret) as { tenantId: string };

      if (!decoded?.tenantId) {
        res
          .status(403)
          .json({ message: 'Invalid token or tenantId not found' });
        return;
      }

      req.tenantId = decoded.tenantId;

      if (
        !req.isTenantConnected ||
        req.tenantConnection?.name !== decoded.tenantId
      ) {
        req.tenantConnection = await connectTenantDB(decoded.tenantId);
        req.isTenantConnected = true;
      }
      next();
      return;
    } catch (err) {
      console.log('Access token expired. Checking refresh token...');

      if (!refreshToken) {
        res
          .status(401)
          .json({ message: 'Session expired. Please log in again.' });
        return;
      }

      try {
        const refreshDecoded = jwt.verify(refreshToken, refreshSecret) as {
          tenantId: string;
        };

        if (!refreshDecoded?.tenantId) {
          res.status(403).json({ message: 'Invalid refresh token' });
          return;
        }

        const newAccessToken = jwt.sign(
          { tenantId: refreshDecoded.tenantId },
          jwtSecret,
          { expiresIn: '15m' }
        );

        res.cookie('accessToken', newAccessToken, {
          httpOnly: true,
          secure: process.env.NODE_ENV === 'production',
          sameSite: 'strict',
        });

        console.log('New access token generated and set in cookies');

        req.tenantId = refreshDecoded.tenantId;

        if (
          !req.isTenantConnected ||
          req.tenantConnection?.name !== refreshDecoded.tenantId
        ) {
          req.tenantConnection = await connectTenantDB(refreshDecoded.tenantId);
          req.isTenantConnected = true;
        }

        next();
        return;
      } catch (refreshErr) {
        console.log('Invalid refresh token:', refreshErr);
        res
          .status(403)
          .json({ message: 'Session expired. Please log in again.' });
        return;
      }
    }
  } catch (error) {
    console.error('Error in tenant middleware:', error);
    res.status(500).json({ message: 'Internal server error' });
    return;
  }
};
