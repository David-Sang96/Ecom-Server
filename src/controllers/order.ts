import { NextFunction, Request, Response } from 'express';
import { validationResult } from 'express-validator';
import mongoose from 'mongoose';
import { Order } from '../models/order';
import AppError from '../utils/AppError';

export const getOrders = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const userId = req.userId;
  const orders = await Order.find({ userId })
    .sort({ createdAt: -1 })
    .populate('userId', 'name email')
    .select('-__v');

  res.json({ success: true, orders });
};

export const getSevenDaysAgoOrder = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const userId = req.userId;
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
  const orders = await Order.find({ createdAt: { $gte: sevenDaysAgo }, userId })
    .sort({ createdAt: -1 })
    .populate('userId', 'name email')
    .select('-__v');

  res.json({ success: true, orders });
};

export const getOneOrder = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const error = validationResult(req).array({ onlyFirstError: true });
  if (error.length) {
    return next(new AppError(error[0].msg, 400));
  }
  const { orderId } = req.params;
  const userId = req.userId;

  const order = await Order.findOne({
    _id: orderId,
    userId: new mongoose.Types.ObjectId(userId),
  }).populate('userId', 'name email');
  console.log(order);

  if (!order) return next(new AppError('Order not found', 404));
  res.json({ success: true, order });
};
