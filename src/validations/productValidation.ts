import { body } from 'express-validator';

export const createProductValidator = [
  body('name', 'Product name should be 3 to 20 characters')
    .trim()
    .notEmpty()
    .isLength({ min: 3, max: 20 })
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
    'category',
    'Invalid category.It must be Eletronics,Clothing,Home & Kitchen or Books.'
  )
    .trim()
    .notEmpty()
    .isIn(['Electronics', 'Clothing', 'Home & Kitchen', 'Books']),
  body('countInStock', 'Product must have at least one stock').isInt({
    min: 1,
  }),
];
