import { NextFunction, Request, Response } from 'express';
import { ENV_VARS } from '../config/envVars';
import AppError from '../utils/AppError';

export const errorMiddleware = (
  err: AppError,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const env = ENV_VARS.NODE_ENV || 'development';
  const status = err.statusCode || 500;
  const message = err.message || 'Something went wrong';

  if (env === 'development') {
    res.status(status).json({
      success: false,
      message,
      error: {
        name: err.name,
        statusCode: err.statusCode,
      },
      stack: err.stack,
    });
  } else {
    res.status(status).json({ success: false, message });
  }
};
