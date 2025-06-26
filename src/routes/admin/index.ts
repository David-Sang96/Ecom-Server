import { NextFunction, Request, Response, Router } from 'express';
import { body } from 'express-validator';
import { MulterError } from 'multer';

import {
  allProducts,
  createProduct,
  deleteProduct,
  getProductSales,
  updateProduct,
} from '../../controllers/admin/product';
import { uploadMultiple } from '../../lib/multer';
import AppError from '../../utils/AppError';
import {
  createProductValidator,
  deleteProductValidator,
  updateProductValidator,
} from '../../validations/productValidation';

const router = Router();

router.get('/', allProducts);
router.get('/product-sales', getProductSales);

router.post(
  '/',
  (req: Request, res: Response, next: NextFunction) => {
    uploadMultiple(req, res, (err) => {
      if (err instanceof MulterError) {
        if (err.code === 'LIMIT_UNEXPECTED_FILE') {
          if (req.files && Array.isArray(req.files) && req.files.length > 10) {
            return next(
              new AppError('You can only upload up to 10 images.', 400)
            );
          }
          return next(new AppError('Unexpected file upload error.', 400));
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
    body('images').custom((_, { req }) => {
      if (!req.files || !Array.isArray(req.files) || req.files.length === 0) {
        throw new AppError('At least one image is required', 400);
      }
      return true;
    }),
  ],
  createProductValidator,
  createProduct
);

router.put(
  '/:productId',
  (req: Request, res: Response, next: NextFunction) => {
    uploadMultiple(req, res, (err) => {
      if (err instanceof MulterError) {
        // A Multer error occurred when uploading.
        if (err.code === 'LIMIT_UNEXPECTED_FILE') {
          if (req.files && Array.isArray(req.files) && req.files.length > 5) {
            return next(
              new AppError('You can only upload up to 5 images.', 400)
            );
          }
          return next(new AppError('Unexpected file upload error.', 400));
        }
        if (err.code === 'LIMIT_FILE_SIZE') {
          return next(new AppError('File too large. Max size is 5MB.', 400));
        }
        return next(new AppError(err.message, 400));
      } else if (err) {
        // An unknown error occurred when uploading.
        return next(new AppError(err.message, 400));
      }
      // Everything went fine.
      next();
    });
  },
  [body('images').optional()],
  updateProductValidator,
  updateProduct
);

router.delete('/:productId', deleteProductValidator, deleteProduct);

export default router;
