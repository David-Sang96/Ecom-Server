import { NextFunction, Request, Response } from 'express';
import { getUserById } from '../services/auth';
import AppError from '../utils/AppError';
import { checkUserNotExist } from '../utils/auth';

export const authorize = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const userId = req.userId;
  const user = await getUserById(userId);
  checkUserNotExist(user);

  if (user!.role !== 'ADMIN') {
    return next(new AppError('This action is not allowed', 403));
  }
  next();
};
