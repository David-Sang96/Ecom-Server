import { NextFunction, Request, Response, Router } from 'express';
import { body } from 'express-validator';
import { MulterError } from 'multer';

import { createProduct } from '../../controllers/admin/product';
import { uploadMultiple } from '../../lib/multer';
import { authorize } from '../../middlewares/authorize';
import { protect } from '../../middlewares/protect';
import AppError from '../../utils/AppError';
import { createProductValidator } from '../../validations/productValidation';

const router = Router();

router.post(
  '/product',
  protect,
  authorize,
  (req: Request, res: Response, next: NextFunction) => {
    uploadMultiple(req, res, (err) => {
      if (err instanceof MulterError) {
        if (err.code === 'LIMIT_UNEXPECTED_FILE') {
          return next(
            new AppError('You can only upload up to 10 images.', 400)
          );
        }
        return next(new AppError(err.message, 400));
      } else if (err) {
        return next(new AppError(err.message, 400));
      }
      next();
    });
  },
  [
    body('images').custom((_, { req }) => {
      if (!req.files || (!Array.isArray(req.files) && req.files.length === 0)) {
        throw new AppError('At least one image is required', 400);
      }
      if (req.files.length > 10) {
        throw new AppError('You can upload up to 10 images only', 400);
      }
      return true;
    }),
  ],
  createProductValidator,
  createProduct
);

export default router;
