import { NextFunction, Request, Response } from 'express';
import { validationResult } from 'express-validator';
import { deleteSingleFile } from '../../lib/upload';
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

export const getOneUser = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { userId } = req.params;

  const user = await User.findById(userId);
  if (!user) {
    return next(new AppError('No user found', 404));
  }
  res.json({ success: true, user });
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
  const { ban, reason, userId, role, isEmailVerified, name } = req.body;
  const adminId = req.userId;

  const user = await getUserById(userId);
  checkUserNotExist(user);

  if (ban && userId.toString() === adminId.toString()) {
    return next(new AppError("You can't ban yourself", 403));
  }

  user!.role = role;
  if (ban && user?.role === 'ADMIN') {
    return next(new AppError("You can't ban another admin", 403));
  }

  if (typeof ban === 'boolean') {
    if (ban) {
      user!.ban = {
        isBanned: true,
        adminId,
        reason,
        bannedAt: new Date(),
      };
      user!.status = 'FREEZE';
    } else {
      user!.ban = {
        isBanned: false,
        adminId: null,
        reason: '',
        bannedAt: null,
      };
      user!.status = 'ACTIVE';
    }
  }

  user!.name = name;
  user!.isEmailVerified = isEmailVerified;
  await user!.save();

  res.json({
    success: true,
    message: 'User info has been updated successfully',
    user: { name: user!.name, email: user!.email },
  });
};

export const deleteUser = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const error = validationResult(req).array({ onlyFirstError: true });
  if (error.length) {
    return next(new AppError(error[0].msg, 400));
  }

  const { userId } = req.params;
  const user = await User.findById(userId);
  if (!user) {
    return next(new AppError('No user found', 404));
  }

  await deleteSingleFile(user.image!.public_id);
  await User.findByIdAndDelete(user._id);
  res.json({
    success: true,
    message: `${user.name} has been deleted successfully`,
  });
};
