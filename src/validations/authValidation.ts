import { body } from 'express-validator';

export const registerValidator = [
  body('name', 'Name must be at least 5 characters')
    .trim()
    .notEmpty()
    .isLength({ min: 5 })
    .escape()
    .customSanitizer((value) => {
      return value
        .split(' ')
        .map((item: string) => item[0].toUpperCase() + item.slice(1))
        .join(' ');
    }),
  body('email', 'Enter a valid email')
    .notEmpty()
    .isEmail()
    .trim()
    .escape()
    .normalizeEmail(),
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
  body('email', 'Enter a valid email')
    .notEmpty()
    .isEmail()
    .trim()
    .escape()
    .normalizeEmail(),
  body('password', 'password must be at least 8 characters')
    .trim()
    .notEmpty()
    .matches(/^(?=.*[a-zA-Z])(?=.*\d)[a-zA-Z\d]+$/)
    .withMessage('Password must contain at least one letters and one digit')
    .isLength({ min: 8 }),
];

export const forgetPasswordEmailValidator = [
  body('email', 'Enter a valid email')
    .notEmpty()
    .isEmail()
    .trim()
    .escape()
    .normalizeEmail(),
];

export const forgetPasswordValidator = [
  body('token', 'Invalid token')
    .notEmpty()
    .isLength({ min: 10 })
    .withMessage('Token looks too short'),
  body('email', 'Enter a valid email')
    .notEmpty()
    .isEmail()
    .trim()
    .escape()
    .normalizeEmail(),

  body('password', 'password must be at least 8 characters')
    .trim()
    .notEmpty()
    .matches(/^(?=.*[a-zA-Z])(?=.*\d)[a-zA-Z\d]+$/)
    .withMessage('Password must contain at least one letters and one digit')
    .isLength({ min: 8 }),
];

export const resetPasswordValidator = [
  // Make 'name' optional, skipping validation if it's undefined or falsy
  body('name', 'Name must be at least 5 characters')
    .optional({ checkFalsy: true })
    .trim()
    .notEmpty()
    .isLength({ min: 5 })
    .escape()
    .customSanitizer((value) => {
      return value
        .split(' ')
        .map((item: string) => item[0].toUpperCase() + item.slice(1))
        .join(' ');
    }),

  // Make 'email' optional, skipping validation if it's undefined or falsy
  body('email', 'Enter a valid email')
    .optional({ checkFalsy: true })
    .notEmpty()
    .isEmail()
    .trim()
    .escape()
    .normalizeEmail(),
  body('oldPassword', 'Old password must be at least 8 characters')
    .optional({ checkFalsy: true })
    .trim()
    .notEmpty()
    .matches(/^(?=.*[a-zA-Z])(?=.*\d)[a-zA-Z\d]+$/)
    .withMessage('Old password must contain at least one letters and one digit')
    .isLength({ min: 8 }),
  body('password', 'New password must be at least 8 characters')
    .optional({ checkFalsy: true })
    .trim()
    .notEmpty()
    .matches(/^(?=.*[a-zA-Z])(?=.*\d)[a-zA-Z\d]+$/)
    .withMessage('New password must contain at least one letters and one digit')
    .isLength({ min: 8 }),
];

export const emailVerificaitonValidator = [
  body('token', 'Invalid token')
    .notEmpty()
    .isLength({ min: 10 })
    .withMessage('Token looks too short'),
  body('userId', 'Invalid user id').notEmpty().isMongoId(),
];

export const deActivateValidator = [
  body('userId', 'User ID is required')
    .notEmpty()
    .trim()
    .isMongoId()
    .withMessage('Invalid User ID format'),
  body('reason', 'Reason is required').trim().notEmpty(),
];
