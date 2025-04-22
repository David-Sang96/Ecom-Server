import { NextFunction, Request, Response } from 'express';
import jwt, { JwtPayload } from 'jsonwebtoken';
import { Types } from 'mongoose';
import { ENV_VARS } from '../config/envVars';
import { IUser } from '../models/user';
import { getUserById } from '../services/auth';
import AppError from '../utils/AppError';
import { checkUserNotExist } from '../utils/auth';
import { generateNewJwtTokens } from '../utils/generate';

export interface CustomJwtPayload extends JwtPayload {
  userId: Types.ObjectId;
  email: string;
}

declare global {
  namespace Express {
    interface Request {
      userId: Types.ObjectId;
      user: IUser;
      files?: any;
    }
  }
}

export const protect = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const accessToken = req.cookies ? req.cookies.accessToken : null;
  const refreshToken = req.cookies ? req.cookies.refreshToken : null;

  if (!refreshToken) {
    return next(
      new AppError(
        'Authentication failed. Refresh token is missing. Please log in again.',
        401
      )
    );
  }

  if (!accessToken) {
    return await generateNewJwtTokens(refreshToken, req, res, next);
  }

  let decode: CustomJwtPayload;
  try {
    decode = jwt.verify(
      accessToken,
      ENV_VARS.ACCESS_TOKEN_SECRET!
    ) as CustomJwtPayload;

    if (!Types.ObjectId.isValid(decode.userId)) {
      return next(new AppError('Authentication failed.Not a valid ID.', 401));
    }

    const user = await getUserById(decode.userId);
    checkUserNotExist(user);

    if (user!.passwordChangedAt) {
      const passwordChangedAt = user!.passwordChangedAt.getTime() / 1000;
      if (Number(decode.iat) < passwordChangedAt) {
        return next(
          new AppError(
            'Password was recently changed. Please log in again.',
            401
          )
        );
      }
    }

    req.user = user!;
    req.userId = user!._id as Types.ObjectId;
    next();
  } catch (error: any) {
    if (error.name === 'TokenExpiredError') {
      return await generateNewJwtTokens(refreshToken, req, res, next);
    } else {
      return next(new AppError('Invalid access token', 401));
    }
  }
};
