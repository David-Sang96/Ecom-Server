import { Router } from 'express';
import { param, query } from 'express-validator';
import {
  checkStripeId,
  confirmOrder,
  getAllProducts,
  getSingleProduct,
  stripePayment,
} from '../controllers/product';

const router = Router();

router.get(
  '/',
  [
    query('page', 'Page number must be an integer').optional().isInt({ gt: 0 }),
    query('limit', 'Limit must be an integer greater than 2')
      .optional()
      .isInt({ gt: 2 }),
    query('cursor', 'Invalid Mongo ID format').optional().trim().isMongoId(),
    query('category')
      .optional()
      .trim()
      .matches(/^([a-zA-Z\s&]+,?)*$/)
      .withMessage('Invalid category format'),
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

router.post('/checkout', stripePayment);

router.post('/confirm-order', confirmOrder);

router.post('/check-stripeId', checkStripeId);

export default router;
