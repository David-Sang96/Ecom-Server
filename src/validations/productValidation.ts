import { body, param } from 'express-validator';

export const createProductValidator = [
  body('name', 'Product name should be 10 to 100 characters')
    .trim()
    .notEmpty()
    .isLength({ min: 10, max: 100 })
    .escape(),
  body('description', 'Description must be at least 10 characters')
    .trim()
    .notEmpty()
    .isLength({ min: 10 })
    .escape(),
  body('price', 'Price is required')
    .isFloat({ min: 0.1 })
    .isDecimal({ decimal_digits: '1,2' })
    .withMessage('decimal allow only 2 places.'),
  body(
    'categories',
    'Invalid categories.Must be Eletronics,Clothing,Kitchen or Books.'
  )
    .trim()
    .notEmpty()
    .isIn(['Electronics', 'Clothing', 'Kitchen', 'Books']),
  body('countInStock', 'Product must have at least one stock').isInt({
    min: 1,
  }),
];

export const updateProductValidator = [
  param('productId')
    .trim()
    .notEmpty()
    .withMessage('Product ID is required')
    .isMongoId()
    .withMessage('Invalid Product ID format'),
  body('name', 'Product name should be 10 to 100 characters')
    .trim()
    .notEmpty()
    .isLength({ min: 10, max: 100 })
    .escape(),
  body('description', 'Description must be at least 10 characters')
    .trim()
    .notEmpty()
    .isLength({ min: 10 })
    .escape(),
  body('price', 'Price is required')
    .isFloat({ min: 0.1 })
    .isDecimal({ decimal_digits: '1,2' })
    .withMessage('decimal allow only 2 places.'),
  body(
    'categories',
    'Invalid categories.Must be Eletronics,Clothing,Kitchen or Books.'
  )
    .trim()
    .notEmpty()
    .isIn(['Electronics', 'Clothing', 'Kitchen', 'Books']),
  body('countInStock', 'Product must have at least one stock').isInt({
    min: 1,
  }),
];

export const deleteProductValidator = [
  param('productId')
    .trim()
    .notEmpty()
    .withMessage('Product ID is required')
    .isMongoId()
    .withMessage('Invalid Product ID format'),
];
