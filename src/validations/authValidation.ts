import { body, query } from 'express-validator';

export const registerValidator = [
  body('name', 'Name must be at least 5 characters')
    .trim()
    .notEmpty()
    .isLength({ min: 5 })
    .escape(),
  body('email', 'Enter a valid email').trim().notEmpty().isEmail(),
  body('password', 'password must be at least 8 characters')
    .trim()
    .notEmpty()
    .matches(/^(?=.*[a-zA-Z])(?=.*\d)[a-zA-Z\d]+$/)
    .withMessage('Password must contain at least one letters and one digit')
    .isLength({ min: 8 }),
  body('role', 'Invalid role').optional().isIn(['admin', 'user']),
  body('secret').optional().trim(),
];

export const loginValidator = [
  body('email', 'Enter a valid email').trim().notEmpty().isEmail(),
  body('password', 'password must be at least 8 characters')
    .trim()
    .notEmpty()
    .matches(/^(?=.*[a-zA-Z])(?=.*\d)[a-zA-Z\d]+$/)
    .withMessage('Password must contain at least one letters and one digit')
    .isLength({ min: 8 }),
];

export const forgetPasswordEmailValidator = [
  body('email', 'Enter a valid email').trim().notEmpty().isEmail(),
];

export const forgetPasswordValidator = [
  query('token', 'Token is required')
    .notEmpty()
    .isLength({ min: 10 })
    .withMessage('Token looks too short'),
  body('email', 'Enter a valid email').trim().notEmpty().isEmail(),
  body('password', 'password must be at least 8 characters')
    .trim()
    .notEmpty()
    .matches(/^(?=.*[a-zA-Z])(?=.*\d)[a-zA-Z\d]+$/)
    .withMessage('Password must contain at least one letters and one digit')
    .isLength({ min: 8 }),
];

export const resetPasswordValidator = [
  body('old-password', 'Old password must be at least 8 characters')
    .trim()
    .notEmpty()
    .matches(/^(?=.*[a-zA-Z])(?=.*\d)[a-zA-Z\d]+$/)
    .withMessage('Old password must contain at least one letters and one digit')
    .isLength({ min: 8 }),
  body('new-password', 'New password must be at least 8 characters')
    .trim()
    .notEmpty()
    .matches(/^(?=.*[a-zA-Z])(?=.*\d)[a-zA-Z\d]+$/)
    .withMessage('New password must contain at least one letters and one digit')
    .isLength({ min: 8 }),
];
