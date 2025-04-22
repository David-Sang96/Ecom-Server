import { randomBytes } from 'crypto';
import { NextFunction, Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { Types } from 'mongoose';

import { ENV_VARS } from '../config/envVars';
import { CustomJwtPayload } from '../middlewares/protect';
import { getUserById, updateUser } from '../services/auth';
import AppError from './AppError';
import { checkUserNotExist } from './auth';

export const generateToken = () => {
  return randomBytes(32).toString('hex');
};

export const generateJwtTokens = (userId: Types.ObjectId, email: string) => {
  const accessTokenPayload = { userId };
  const refreshTokenPayload = { userId, email };

  const accessToken = jwt.sign(
    accessTokenPayload,
    ENV_VARS.ACCESS_TOKEN_SECRET!,
    { expiresIn: '15m' }
  );

  const refreshToken = jwt.sign(
    refreshTokenPayload,
    ENV_VARS.REFRESH_TOKEN_SECRET!,
    { expiresIn: '30d' }
  );

  return { accessToken, refreshToken };
};

export const generateNewJwtTokens = async (
  oldRefreshToken: string,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  let decode: CustomJwtPayload;
  try {
    decode = jwt.verify(
      oldRefreshToken,
      ENV_VARS.REFRESH_TOKEN_SECRET!
    ) as CustomJwtPayload;
  } catch (error) {
    return next(
      new AppError(
        'Authentication failed. Refresh token is invalid. Please log in again.',
        401
      )
    );
  }

  if (!Types.ObjectId.isValid(decode.userId)) {
    return next(new AppError('Authentication failed.Not a valid ID.', 401));
  }

  const user = await getUserById(decode.userId);
  checkUserNotExist(user);
  const userId = user!._id as Types.ObjectId;

  if (user!.email !== decode.email) {
    return next(
      new AppError('Authentication failed.Please log in again.', 401)
    );
  }

  if (user!.refreshToken !== oldRefreshToken) {
    return next(
      new AppError('Authentication failed.Please log in again.', 401)
    );
  }

  const { accessToken, refreshToken: newRefreshToken } = generateJwtTokens(
    userId,
    user!.email
  );

  await updateUser(userId, { refreshToken: newRefreshToken });

  res
    .cookie('accessToken', accessToken, {
      maxAge: 15 * 60 * 1000,
      httpOnly: true,
      sameSite: ENV_VARS.NODE_ENV === 'production' ? 'none' : 'strict',
      secure: ENV_VARS.NODE_ENV === 'production',
      path: '/',
    })
    .cookie('refreshToken', newRefreshToken, {
      maxAge: 30 * 24 * 60 * 60 * 1000,
      httpOnly: true,
      sameSite: ENV_VARS.NODE_ENV === 'production' ? 'none' : 'strict',
      secure: ENV_VARS.NODE_ENV === 'production',
      path: '/',
    });

  req.user = user!;
  req.userId = userId;
  next();
};
