import { body, param } from 'express-validator';

export const mongoIdValidator = [
  param('orderId')
    .trim()
    .notEmpty()
    .withMessage('Order ID is required')
    .isMongoId()
    .withMessage('Invalid Order ID format'),
];

export const updateOrderValidator = [
  param('orderId')
    .trim()
    .notEmpty()
    .withMessage('Order ID is required')
    .isMongoId()
    .withMessage('Invalid Order ID format'),
  body('status')
    .trim()
    .notEmpty()
    .withMessage('Status is required')
    .isIn([
      'pending',
      'processing',
      'failed',
      'shipped',
      'cancelled',
      'completed',
    ])
    .withMessage('Invalid status'),
];
