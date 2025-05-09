import { NextFunction, Request, Response } from 'express';
import { validationResult } from 'express-validator';
import { uploadMultipleFiles } from '../../lib/upload';
import { Product } from '../../models/product';
import AppError from '../../utils/AppError';

export const createProduct = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const error = validationResult(req).array({ onlyFirstError: true });
  if (error.length > 0) {
    return next(new AppError(error[0].msg, 400));
  }

  const uploadedFiles = req.files as Express.Multer.File[];
  const { name, description, price, countInStock } = req.body;
  const owner = req.userId;

  let categories = req.body.category;
  if (!Array.isArray(categories)) {
    categories = [categories];
  }

  if (!uploadedFiles || uploadedFiles.length === 0) {
    return next(new AppError('No files uploaded', 400));
  }

  const images = await uploadMultipleFiles(
    uploadedFiles.map((file) => file.path)
  );

  const product = new Product({
    name,
    description,
    price,
    category: categories,
    countInStock,
    owner,
    images: images.map((item) => item.secure_url),
    public_id: images.map((item) => item.public_id),
  });

  await product.save();
  res.status(201).json({ success: true, product });
};
