import { NextFunction, Request, Response } from 'express';
import { validationResult } from 'express-validator';
import { User } from '../../models/user';
import { getUserById } from '../../services/auth';
import AppError from '../../utils/AppError';
import { checkUserNotExist } from '../../utils/auth';

export const getAllUsers = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const users = await User.find();
  if (!users) {
    return next(new AppError('No users found', 404));
  }
  res.json({ success: true, users });
};

export const updateUser = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const error = validationResult(req).array({ onlyFirstError: true });
  if (error.length) {
    return next(new AppError(error[0].msg, 400));
  }
  const { ban, reason, userId } = req.body;
  const adminId = req.userId;

  const user = await getUserById(userId);
  checkUserNotExist(user);

  if (ban === 'true') {
    user!.ban = {
      isBanned: true,
      adminId,
      reason,
      bannedAt: new Date(),
    };
  } else {
    user!.ban = {
      isBanned: false,
      adminId: null,
      reason: '',
      bannedAt: null,
    };
  }
  await user!.save();

  res.json({
    success: true,
    message: ban === 'true' ? 'User has been banned' : 'User has been unbanned',
  });
};
