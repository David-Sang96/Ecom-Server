import { NextFunction, Request, Response } from 'express';
import { validationResult } from 'express-validator';
import { Types } from 'mongoose';
import { Product } from '../models/product';
import AppError from '../utils/AppError';

export const getSingleProduct = async (
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

  const product = await Product.findOne({
    _id: productId,
    ownerId: req.userId,
  }).select('__v');
  if (!product) {
    return next(new AppError('Product not found', 404));
  }
  res.json({ success: true, product });
};

export const getAllProducts = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  //   const page = parseInt(req.query.page as string) || 1;
  //   const skip = (page - 1) * limit;
  const cursor = req.query.cursor as string;
  const limit = parseInt(req.query.limit as string) || 6;
  const categories = req.query.category as string[];

  const error = validationResult(req).array({ onlyFirstError: true });
  if (error.length > 0) {
    return next(new AppError(error[0].msg, 400));
  }

  if (cursor && !Types.ObjectId.isValid(cursor)) {
    return next(new AppError('Invalid Mongo ID format', 400));
  }

  const filter: any = {};
  if (categories) {
    let categoriesArray: string[] = [];
    if (Array.isArray(categories)) {
      categoriesArray = categories.filter(Boolean);
    } else {
      categoriesArray = [categories];
    }

    filter.categories = { $in: categoriesArray };
  }

  // Prisma needs skip: 1 because it uses cursor equality to start the next page.
  // MongoDB uses $lt or $gt to continue, so you already skip the current one by design, no need for extra skip.
  if (cursor) {
    filter._id = { $lt: new Types.ObjectId(cursor) };
  }

  const products = await Product.find(filter)
    .lean()
    .populate('ownerId', '_id email name image role status ')
    .sort({ _id: -1 })
    // .skip(skip)
    .limit(limit + 1); // Get one extra to determine if there's a next page

  const hasNextPage = products.length > limit;
  //   let nextPage = null;
  //   const previousPage = page !== 1 ? page - 1 : null;

  if (hasNextPage) {
    products.pop();
    // nextPage = page + 1;
  }

  const nextCursor =
    products.length > 0 ? products[products.length - 1]._id : null;

  res.json({
    message: 'Get all infinite products',
    prevCursor: cursor ?? null,
    products,
    nextCursor,
    hasNextPage,
  });
};
