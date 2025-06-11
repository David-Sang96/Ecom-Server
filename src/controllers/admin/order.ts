import { NextFunction, Request, Response } from 'express';
import { validationResult } from 'express-validator';
import { Order } from '../../models/order';
import AppError from '../../utils/AppError';

export const getAllOrders = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const orders = await Order.find()
    .sort({ createdAt: -1 })
    .populate('userId', 'name');
  if (!orders) {
    return next(new AppError('No orders found', 404));
  }
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

  const order = await Order.findOne({ _id: orderId, userId });
  if (!order) return next(new AppError('Order not found', 404));

  res.json({ success: true, order });
};

export const updateOrder = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const error = validationResult(req).array({ onlyFirstError: true });
  if (error.length) {
    return next(new AppError(error[0].msg, 400));
  }
  const { status } = req.body;
  const userId = req.userId;
  const { orderId } = req.params;

  const updatedOrder = await Order.findOneAndUpdate(
    { _id: orderId, userId },
    { status },
    { new: true }
  );
  if (!updatedOrder) return next(new AppError('Order not found', 404));

  res.json({
    success: true,
    order: updatedOrder,
    message: 'Order updated successfully',
  });
};

export const deleteOrder = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const userId = req.userId;
  const { orderId } = req.params;
  const order = await Order.findOne({ _id: orderId, userId });
  if (!order) return next(new AppError('Order not found', 404));

  await Order.findByIdAndDelete(orderId);
  res.json({ success: true, message: 'Order deleted successfully' });
};
