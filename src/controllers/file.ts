import { NextFunction, Request, Response } from 'express';
import { validationResult } from 'express-validator';
import { Types } from 'mongoose';
import { deleteSingleFile, uploadSingleFile } from '../lib/upload';
import { Product } from '../models/product';
import { User } from '../models/user';
import AppError from '../utils/AppError';

export const deleteImage = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const error = validationResult(req).array({ onlyFirstError: true });
  if (error.length > 0) {
    return next(new AppError(error[0].msg, 400));
  }
  const { productId, publicId } = req.body;
  const userId = req.userId;

  const user = await User.findById(userId);
  if (!user) {
    return next(new AppError('User not found', 404));
  }

  if (!Types.ObjectId.isValid(productId)) {
    return next(new AppError('Invalid Product ID format', 400));
  }

  const product = await Product.findOne({ _id: productId, ownerId: user._id });
  if (!product) {
    return next(new AppError('Product not found', 404));
  }

  if (product.images.length === 1) {
    return next(new AppError('Product must have at least one image', 409));
  }

  if (!product.images.find((item) => item.public_id === publicId)) {
    return next(new AppError('Invalid public ID', 400));
  }

  product.images = product.images.filter((item) => item.public_id !== publicId);
  await product.save();

  await deleteSingleFile(publicId);
  res.json({ success: true, message: 'Image deleted successfully' });
};

export const uploadProfileImage = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const error = validationResult(req).array({ onlyFirstError: true });
  if (error.length > 0) {
    return next(new AppError(error[0].msg, 400));
  }
  const userId = req.userId;
  const uploadedImage = req.file as Express.Multer.File;

  const user = await User.findById(userId);
  if (!user) {
    return next(new AppError('User not found', 404));
  }

  if (user.image?.public_id) {
    await deleteSingleFile(user.image?.public_id);
  }

  const { public_id, secure_url } = await uploadSingleFile(uploadedImage.path);

  user.image = { url: secure_url, public_id };
  await user.save();

  const updatedUser = await User.findById(user._id).select(
    '_id name email status isEmailVerified image role status updatedAt'
  );
  res.json({
    success: true,
    message: 'Image uploaded successfully',
    updatedUser,
  });
};
