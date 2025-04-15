import compression from 'compression';
import cors from 'cors';
import express, { Request, Response } from 'express';
import helmet from 'helmet';
import morgan from 'morgan';

import { errorMiddleware } from './middlewares/errorHandler';
import { rateLimiter } from './middlewares/reateLimiter';
import AppError from './utils/AppError';
import { catchAsync } from './utils/asyncErrorHandler';

export const app = express();

app
  .use(morgan('dev'))
  .use(express.json())
  .use(express.urlencoded({ extended: true }))
  .use(cors())
  .use(helmet())
  .use(compression())
  .use(rateLimiter);

app.get(
  '/user',
  catchAsync(async (req: Request, res: Response) => {
    throw new AppError('User not found', 400);
  })
);

app.use(errorMiddleware);
