import { NextFunction, Request, Response, Router } from 'express';
import { body } from 'express-validator';

import { MulterError } from 'multer';
import {
  deleteImage,
  downLoadImage,
  uploadProfileImage,
} from '../controllers/file';
import { uploadSingle } from '../lib/multer';
import { authorize } from '../middlewares/authorize';
import { protect } from '../middlewares/protect';
import AppError from '../utils/AppError';

const router = Router();

router.get('/download-image', downLoadImage);

router.post(
  '/profile',
  protect,
  (req: Request, res: Response, next: NextFunction) => {
    uploadSingle(req, res, (err) => {
      if (err instanceof MulterError) {
        if (err.code === 'LIMIT_UNEXPECTED_FILE') {
          return next(new AppError('You can upload only one image.', 400));
        }
        if (err.code === 'LIMIT_FILE_SIZE') {
          return next(new AppError('File too large. Max size is 5MB.', 400));
        }
        return next(new AppError(err.message, 400));
      } else if (err) {
        return next(new AppError(err.message, 400));
      }
      next();
    });
  },
  [
    body('image').custom((_, { req }) => {
      if (!req.file) {
        throw new AppError('Image is required', 400);
      }
      return true;
    }),
  ],
  uploadProfileImage
);

router.delete(
  '/',
  protect,
  authorize,
  [
    body('productId')
      .trim()
      .notEmpty()
      .withMessage('Product ID is required')
      .isMongoId()
      .withMessage('Invalid Product ID format'),
    body('publicId', 'Public ID is required')
      .trim()
      .notEmpty()
      .isLength({ max: 20 })
      .withMessage('Public ID must be 20 characters'),
  ],
  deleteImage
);

export default router;
