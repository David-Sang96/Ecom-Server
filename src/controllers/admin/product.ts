import { NextFunction, Request, Response } from 'express';
import { validationResult } from 'express-validator';
import { Types } from 'mongoose';
import { deleteMultipleFiles, uploadMultipleFiles } from '../../lib/upload';
import { Order } from '../../models/order';
import { Product } from '../../models/product';
import { User } from '../../models/user';
import AppError from '../../utils/AppError';

export const allProducts = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const ownerId = req.userId;
  const products = await Product.find({ ownerId }).select(
    '-__v -createdAt -updatedAt'
  );
  if (!products) {
    return next(new AppError('No products found', 404));
  }
  res.json({ success: true, products });
};

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
  const ownerId = req.userId;

  let categories = req.body.categories;
  if (!Array.isArray(categories)) {
    categories = [categories];
  }

  if (!uploadedFiles || uploadedFiles.length === 0) {
    return next(new AppError('No files uploaded', 400));
  }

  const result = await uploadMultipleFiles(
    uploadedFiles.map((file) => file.path)
  );

  const product = new Product({
    name,
    description,
    price,
    categories,
    countInStock,
    ownerId,
    images: result.map((item) => ({
      url: item.secure_url,
      public_id: item.public_id,
    })),
  });

  await product.save();
  res
    .status(201)
    .json({ success: true, product, message: 'Product created successfully' });
};

export const updateProduct = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const error = validationResult(req).array({ onlyFirstError: true });
  if (error.length > 0) {
    return next(new AppError(error[0].msg, 400));
  }

  const { productId } = req.params;
  const { name, description, price, countInStock } = req.body;
  const newImages = req.files as Express.Multer.File[];

  if (!Types.ObjectId.isValid(productId)) {
    return next(new AppError('Invalid mongo ID', 400));
  }

  let categories = req.body.categories;
  if (!Array.isArray(categories)) {
    categories = [categories];
  }

  const existingProduct = await Product.findOne({
    ownerId: req.userId,
    _id: productId,
  });

  if (!existingProduct) {
    return next(new AppError('Product not found', 404));
  }

  if (newImages) {
    const result = await uploadMultipleFiles(newImages.map((img) => img.path));
    const newResultImages = result.map((item) => ({
      url: item.secure_url,
      public_id: item.public_id,
    }));
    const images = [...newResultImages, ...existingProduct.images];

    const updatedProduct = await Product.findOneAndUpdate(
      { _id: existingProduct._id, ownerId: existingProduct.ownerId },
      {
        name,
        description,
        categories,
        price,
        countInStock,
        images,
        ownerId: existingProduct.ownerId,
      },
      { new: true, runValidators: true }
    );

    res.json({
      success: true,
      message: 'Product updated succesfully',
      product: updatedProduct,
    });
  } else {
    const updatedProduct = await Product.findOneAndUpdate(
      { _id: existingProduct._id, ownerId: existingProduct.ownerId },
      {
        name,
        description,
        categories,
        price,
        countInStock,
        ownerId: existingProduct.ownerId,
      },
      { new: true, runValidators: true }
    );

    res.json({
      success: true,
      message: 'Product updated succesfully',
      product: updatedProduct,
    });
  }
};

export const deleteProduct = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const error = validationResult(req).array({ onlyFirstError: true });
  if (error.length > 0) {
    return next(new AppError(error[0].msg, 400));
  }

  const { productId } = req.params;
  if (!Types.ObjectId.isValid(productId)) {
    return next(new AppError('Invalid mongo ID', 400));
  }

  const product = await Product.findById(productId);
  if (!product) {
    return next(new AppError('Product not found', 404));
  }

  const publicIds = product.images.map((item) => item.public_id);
  await deleteMultipleFiles(publicIds);
  await Product.findOneAndDelete({
    _id: product._id,
    ownerId: product.ownerId,
  });

  res.json({ success: true, message: 'Product deleted successfully' });
};

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

export const getProductSales = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const lastSevenDay = new Date();
  lastSevenDay.setDate(lastSevenDay.getDate() - 7);

  const sales = await Order.aggregate([
    {
      $match: {
        createdAt: { $gte: lastSevenDay },
      },
    },
    { $unwind: '$items' },
    { $unwind: '$items.categories' }, // unwind categories array
    {
      $project: {
        // productId: '$items.productId',
        category: '$items.categories',
        name: '$items.name',
        quantity: '$items.quantity',
        price: '$items.price',
        date: {
          $dateToString: { format: '%Y-%m-%d', date: '$createdAt' },
        },
        rawDate: '$createdAt',
      },
    },
    {
      $group: {
        _id: {
          // productId: '$productId',
          category: '$category',
          date: '$date',
        },
        // name: { $first: '$name' },
        totalProduct: { $sum: 1 },
        totalSold: { $sum: '$quantity' },
        totalRevenue: {
          $sum: { $multiply: ['$price', '$quantity'] },
        },
        rawDate: { $min: '$rawDate' },
      },
    },
    { $sort: { rawDate: 1 } },
  ]);

  if (!sales) {
    return next(new AppError('Failed to get sales data', 500));
  }
  res.json({ success: true, sales });
};
