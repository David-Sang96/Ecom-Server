import compression from 'compression';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import express from 'express';
import helmet from 'helmet';
import morgan from 'morgan';
import path from 'path';

import './config/cron';
import { ENV_VARS } from './config/envVars';
import { errorMiddleware } from './middlewares/errorHandler';
import { rateLimiter } from './middlewares/reateLimiter';
import routes from './routes';

export const app = express();

const whiteList = [ENV_VARS.CLIENT_URL, 'http://localhost:5173'];
const corsOptions = {
  origin: (origin: any, cb: (err: Error | null, origin?: any) => void) => {
    if (!origin) return cb(null, true);
    if (whiteList.includes(origin)) {
      cb(null, true);
    } else {
      cb(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
};

app
  .use(morgan('dev'))
  .use(express.json())
  .use(express.urlencoded({ extended: true }))
  .use(cookieParser())
  .use(cors(corsOptions))
  .use(helmet())
  .use(compression())
  .use(rateLimiter);

app.set('views', './src/views');
app.set('view engine', 'ejs');
app.use('/public', express.static(path.resolve(__dirname, '../public')));

app.use('/api/v1', routes);

app.use(errorMiddleware);
