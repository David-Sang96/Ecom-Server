import { NextFunction, Request, Response } from 'express';
import { validationResult } from 'express-validator';
import { Types } from 'mongoose';
import { ENV_VARS } from '../config/envVars';
import stripe from '../lib/stripe';
import { Order } from '../models/order';
import { Product } from '../models/product';
import { User } from '../models/user';
import { CartProductType } from '../types';
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

  const user = await User.findById(req.userId);

  let product;
  if (user?.role === 'ADMIN') {
    product = await Product.findOne({
      _id: productId,
      ownerId: req.userId,
    }).select('-__v');
  } else {
    product = await Product.findOne({
      _id: productId,
    }).select('-__v');
  }

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
  const categories = req.query.category as string;

  const error = validationResult(req).array({ onlyFirstError: true });
  if (error.length > 0) {
    return next(new AppError(error[0].msg, 400));
  }

  if (cursor && !/^[0-9a-fA-F]{24}$/.test(cursor)) {
    return next(new AppError('Invalid Mongo ID format', 400));
  }

  const filter: any = {};
  if (categories) {
    const categoriesArray = categories
      .split(',')
      .filter(Boolean)
      .map(
        (item) => item.trim().slice(0, 20)
        // (item) => item.replace(/[^a-zA-Z]/g, '').slice(0, 20) only letters, max 20 chars
      )
      .filter(Boolean);

    if (categoriesArray.length > 0) {
      filter.categories = { $in: categoriesArray };
    }
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

export const stripePayment = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { products } = req.body;
  const extractingItems = products.map((item: CartProductType) => ({
    price_data: {
      currency: 'usd',
      unit_amount: item.price * 100,
      product_data: {
        name: item.name,
        description: `${item.description}\nSizes: ${item.sizes.join(', ')}`,
        images: [item.image],
      },
    },
    quantity: item.quantity,
  }));

  const session = await stripe.checkout.sessions.create({
    line_items: extractingItems,
    mode: 'payment',
    success_url: `${ENV_VARS.CLIENT_URL}/success?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${ENV_VARS.CLIENT_URL}/cancel`,
    metadata: {
      userId: String(req.userId),
      cart: JSON.stringify(
        products.map((item: CartProductType) => ({
          _id: item._id,
          quantity: item.quantity,
          sizes: item.sizes.join(','),
        }))
      ),
    },
  });

  res.json({ message: 'Keep alive!', success: true, id: session?.id });
};

export const confirmOrder = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { sessionId } = req.body;

  const isExisted = await Order.findOne({ stripeSessionId: sessionId });
  if (isExisted) {
    return next(new AppError('Order already created', 409));
  }
  const session = await stripe.checkout.sessions.retrieve(sessionId);

  if (session.payment_status === 'paid') {
    const userId = req.userId;
    const cartItems = JSON.parse(session.metadata?.cart || '[]');

    const fullProducts = await Product.find({
      _id: { $in: cartItems.map((item: any) => item._id) },
    });

    const extractingItems = fullProducts.map((product) => {
      const cartItem = cartItems.find(
        (item: any) =>
          item._id.toString() === (product._id as string).toString()
      );
      return {
        productId: product._id,
        name: product.name,
        description: product.description,
        price: product.price,
        categories: product.categories,
        quantity: cartItem.quantity,
        images: product.images.map((item) => item.url),
        sizes: cartItem.sizes.split(','),
      };
    });

    const totalPrice = extractingItems.reduce((acc: number, item: any) => {
      return acc + item.price * item.quantity;
    }, 0);

    const newOrder = await Order.create({
      userId,
      items: extractingItems,
      totalPrice,
      stripeSessionId: sessionId,
      paymentStatus: session.payment_status,
    });

    res
      .status(201)
      .json({ message: 'Order confirmed', order: newOrder, success: true });
  }
};

export const checkStripeId = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { sessionId } = req.body;

  const isExisted = await Order.findOne({ stripeSessionId: sessionId });
  if (isExisted) {
    return next(new AppError('Order already created', 409));
  }

  const session = await stripe.checkout.sessions.retrieve(sessionId);

  if (!session || session.payment_status !== 'paid') {
    return next(new AppError('Invalid or unpaid session', 400));
  }

  res.json({ success: true, message: 'Valid stripe ID' });
};

export const getOrdersByUser = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const userId = req.userId;
  const orders = await Order.find({ userId });
  if (!orders) {
    return next(new AppError('No orders found', 404));
  }
  res.json({ success: true, orders });
};
