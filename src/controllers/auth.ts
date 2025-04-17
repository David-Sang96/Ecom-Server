import { NextFunction, Request, Response } from 'express';
import { validationResult } from 'express-validator';
import jwt, { JwtPayload } from 'jsonwebtoken';
import moment from 'moment';

import { Types } from 'mongoose';
import { ENV_VARS } from '../config/envVars';
import { createUser, getUserByEmail, updateUser } from '../services/auth';
import AppError from '../utils/AppError';
import {
  checkAccountStatus,
  checkUserExist,
  checkUserNotExist,
} from '../utils/auth';
import { generateJwtTokens, generateToken } from '../utils/generate';

export const register = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const errors = validationResult(req).array({ onlyFirstError: true });
  if (errors.length > 0) {
    return next(new AppError(errors[0].msg, 400));
  }
  const { name, email, password, role, secret } = req.body;
  const existinguser = await getUserByEmail(email);
  checkUserExist(existinguser);

  let userRole = 'USER';
  if (role === 'admin') {
    if (secret === ENV_VARS.ADMIN_SECRET) {
      userRole = 'ADMIN';
    }
  }

  const newUser = await createUser(name, email, password, userRole);

  const userId = newUser._id as Types.ObjectId;
  const { accessToken, refreshToken } = generateJwtTokens(
    userId,
    newUser.email
  );

  await updateUser(userId, { refreshToken });

  res
    .cookie('accessToken', accessToken, {
      maxAge: 15 * 60 * 1000,
      httpOnly: true,
      sameSite: ENV_VARS.NODE_ENV === 'production' ? 'none' : 'strict',
      secure: ENV_VARS.NODE_ENV === 'production',
      path: '/',
    })
    .cookie('refreshToken', refreshToken, {
      maxAge: 30 * 24 * 60 * 60 * 1000,
      httpOnly: true,
      sameSite: ENV_VARS.NODE_ENV === 'production' ? 'none' : 'strict',
      secure: ENV_VARS.NODE_ENV === 'production',
      path: '/',
    })
    .status(201)
    .json({
      message: 'Register successfully',
      success: true,
      user: {
        id: newUser._id,
        name: newUser.name,
        email: newUser.email,
        role: newUser.role,
      },
    });
};

export const login = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const error = validationResult(req).array({ onlyFirstError: true });
  if (error.length > 0) {
    return next(new AppError(error[0].msg, 400));
  }

  const { email, password } = req.body;
  const existingUser = await getUserByEmail(email);
  checkUserNotExist(existingUser);
  const userId = existingUser!._id as Types.ObjectId;

  checkAccountStatus(existingUser!.status);
  const isSameDate = moment(existingUser!.updatedAt).isSame(new Date(), 'day');

  const isMatch = await existingUser?.isMatchPassword(password);
  if (!isMatch) {
    if (!isSameDate) {
      await updateUser(userId, { errorLoginCount: 1 });
    } else {
      if (existingUser!.errorLoginCount === 2) {
        await updateUser(userId, { status: 'FREEZE' });
      } else {
        await updateUser(userId, { $inc: { errorLoginCount: 1 } });
      }
    }
    return next(new AppError('Invalid credential', 401));
  }

  const { accessToken, refreshToken } = generateJwtTokens(
    userId,
    existingUser!.email
  );

  await updateUser(userId, { refreshToken });

  res
    .cookie('accessToken', accessToken, {
      maxAge: 15 * 60 * 1000,
      httpOnly: true,
      sameSite: ENV_VARS.NODE_ENV === 'production' ? 'none' : 'strict',
      secure: ENV_VARS.NODE_ENV === 'production',
      path: '/',
    })
    .cookie('refreshToken', refreshToken, {
      maxAge: 30 * 24 * 60 * 60 * 1000,
      httpOnly: true,
      sameSite: ENV_VARS.NODE_ENV === 'production' ? 'none' : 'strict',
      secure: ENV_VARS.NODE_ENV === 'production',
      path: '/',
    })
    .status(201)
    .json({
      message: 'Logged in successfully',
      success: true,
      user: {
        id: existingUser!._id,
        name: existingUser!.name,
        email: existingUser!.email,
        role: existingUser!.role,
      },
    });
};

interface CustomJwtPayload extends JwtPayload {
  userId: Types.ObjectId;
  email: string;
}

export const logout = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const refreshToken = req.cookies ? req.cookies.refreshToken : null;
  console.log(refreshToken);

  if (!refreshToken) {
    return next(
      new AppError(
        'Refresh token is missing or invalid. Please log in again.',
        401
      )
    );
  }

  let decode: CustomJwtPayload;
  try {
    decode = jwt.verify(
      refreshToken,
      ENV_VARS.REFRESH_TOKEN_SECRET!
    ) as CustomJwtPayload;
  } catch (error) {
    return next(
      new AppError('Authentication failed. Please log in again.', 401)
    );
  }

  if (!decode.userId || !decode.email) {
    return next(new AppError('Authentication failed.Please login again.', 401));
  }

  const user = await getUserByEmail(decode.email);
  checkUserNotExist(user);

  await updateUser(decode.userId, { refreshToken: generateToken() });

  res.clearCookie('accessToken', {
    httpOnly: true,
    sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'strict',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
  });

  res.clearCookie('refreshToken', {
    httpOnly: true,
    sameSite: ENV_VARS.NODE_ENV === 'production' ? 'none' : 'strict',
    secure: ENV_VARS.NODE_ENV === 'production',
    path: '/',
  });
  res.json({ message: 'Logged out successfully.See you soon.' });
};
