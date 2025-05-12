import { Router } from 'express';
import { param, query } from 'express-validator';
import { getAllProducts, getSingleProduct } from '../controllers/product';

const router = Router();

router.get(
  '/',
  [
    query('page', 'Page number must be an integer').optional().isInt({ gt: 0 }),
    query('limit', 'Limit must be an integer greater than 5')
      .optional()
      .isInt({ gt: 5 }),
    query('cursor', 'Invalid Mongo ID format').optional().trim().isMongoId(),
  ],
  getAllProducts
);
router.get(
  '/:productId',
  [
    param('productId')
      .trim()
      .notEmpty()
      .withMessage('Product ID is required')
      .isMongoId()
      .withMessage('Invalid Product ID format'),
  ],
  getSingleProduct
);

export default router;
