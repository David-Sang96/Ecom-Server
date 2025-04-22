import { NextFunction, Request, Response } from 'express';
import { validationResult } from 'express-validator';
import jwt from 'jsonwebtoken';
import moment from 'moment';

import { Types } from 'mongoose';
import { ENV_VARS } from '../config/envVars';
import { CustomJwtPayload } from '../middlewares/protect';
import { USER } from '../models/user';
import {
  createUser,
  getUserByEmail,
  getUserById,
  updateUser,
} from '../services/auth';
import AppError from '../utils/AppError';
import {
  checkAccountStatus,
  checkUserExist,
  checkUserNotExist,
} from '../utils/auth';
import { generateJwtTokens, generateToken } from '../utils/generate';
import { sendForgetEMail } from '../utils/sendForgetEmail';
import { sendWelcomeEMail } from '../utils/sendWelcomeEmail';

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
  if (role === 'admin' && secret) {
    if (secret === ENV_VARS.ADMIN_SECRET) {
      userRole = 'ADMIN';
    } else {
      return next(new AppError('Invalid admin secret code', 400));
    }
  }

  const newUser = await createUser(name, email, password, userRole);

  const userId = newUser._id as Types.ObjectId;
  const { accessToken, refreshToken } = generateJwtTokens(
    userId,
    newUser.email
  );

  await updateUser(userId, { refreshToken });
  sendWelcomeEMail(
    newUser.email,
    'Welcome to our ecommerce website!',
    newUser.name,
    newUser.role
  );

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

  const isToday = moment(existingUser!.updatedAt).isSame(new Date(), 'day');
  if (!isToday) {
    if (existingUser!.status === 'FREEZE') {
      await updateUser(userId, { status: 'ACTIVE', errorLoginCount: 0 });
    } else {
      await updateUser(userId, { errorLoginCount: 0 });
    }
  }

  checkAccountStatus(existingUser!.status);

  const isMatch = await existingUser?.isMatchPassword(password);
  if (!isMatch) {
    if (existingUser!.errorLoginCount >= 2) {
      await updateUser(userId, { status: 'FREEZE', errorLoginCount: 3 });
    } else {
      await updateUser(userId, { $inc: { errorLoginCount: 1 } });
    }
    return next(new AppError('Invalid credential', 401));
  }

  const { accessToken, refreshToken } = generateJwtTokens(
    userId,
    existingUser!.email
  );

  await updateUser(userId, { refreshToken, errorLoginCount: 0 });

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

export const logout = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const refreshToken = req.cookies ? req.cookies.refreshToken : null;

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

export const sentEmailForForgetPassword = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const error = validationResult(req).array({ onlyFirstError: true });
  if (error.length > 0) {
    return next(new AppError(error[0].msg, 400));
  }

  const { email } = req.body;
  const user = await getUserByEmail(email);
  checkUserNotExist(user);

  const token = generateToken();
  const tokenExpiry = Date.now() + 1000 * 60 * 15;

  user!.resetToken = token;
  user!.resetTokenExpiry = new Date(tokenExpiry);
  await user?.save();

  sendForgetEMail(user!.email, 'Reset your password', user!.name, token);

  res.json({ success: true, message: 'Reset email sent!' });
};

export const forgetPassword = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const error = validationResult(req).array({ onlyFirstError: true });
  if (error.length > 0) {
    return next(new AppError(error[0].msg, 400));
  }

  const { password, email } = req.body;
  const resetToken = req.query.token;

  if (typeof resetToken !== 'string') {
    return next(new AppError('Invalid or missing reset token', 400));
  }

  const user = await USER.findOne({ email });
  checkUserNotExist(user);
  const userId = user!._id as Types.ObjectId;

  const isToday = moment(user!.updatedAt).isSame(new Date(), 'day');
  if (!isToday) {
    if (user!.status === 'FREEZE') {
      await updateUser(userId, { status: 'ACTIVE', error: 0 });
    } else {
      await updateUser(userId, { error: 0 });
    }
  }

  checkAccountStatus(user!.status);

  const isExpired = moment().isAfter(moment(user!.resetTokenExpiry));
  if (isExpired) {
    return next(new AppError('Reset token has expired', 401));
  }

  if (resetToken !== user!.resetToken) {
    if (user!.error >= 2) {
      await updateUser(userId, { status: 'FREEZE', error: 3 });
      return next(
        new AppError(
          'Your account is temporarily locked.Please try again later',
          401
        )
      );
    } else {
      await updateUser(userId, { $inc: { error: 1 } });
    }
    return next(new AppError('Invalid reset token.', 401));
  }

  if (user!.status === 'FREEZE') {
    await updateUser(userId, { status: 'ACTIVE' });
  }

  if (resetToken === user!.resetToken && user?.status === 'FREEZE')
    await updateUser(userId, { status: 'ACTIVE' });

  user!.password = password;
  user!.resetToken = null;
  user!.resetTokenExpiry = null;
  user!.error = 0;
  user!.passwordChangedAt = new Date();
  await user?.save();

  res.json({
    success: true,
    message: 'Password has been changed successfully',
    user: {
      id: user!._id,
      name: user!.name,
      email: user!.email,
      role: user!.role,
    },
  });
};

export const resetPassword = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const error = validationResult(req).array({ onlyFirstError: true });
  if (error.length > 0) {
    return next(new AppError(error[0].msg, 400));
  }
  const { oldPassword, password } = req.body;
  const userId = req.userId;

  const user = await getUserById(userId);
  checkUserNotExist(user);

  const isMatch = await user!.isMatchPassword(oldPassword);
  if (!isMatch) {
    return next(new AppError('Old password is incorrect', 400));
  }

  user!.password = password;
  await user!.save();

  res.json({ success: true, message: 'Password updated successfully' });
};
