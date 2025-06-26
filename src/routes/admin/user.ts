import { Router } from 'express';
import { body, param } from 'express-validator';
import {
  deleteUser,
  getAllUsers,
  getOneUser,
  updateUser,
} from '../../controllers/admin/user';

const router = Router();

router.get('/', getAllUsers);

router.get('/:userId', getOneUser);

router.put(
  '/',
  [
    body('isEmailVerified')
      .isBoolean()
      .withMessage('IsEmailVerified must be a boolean'),
    body('ban').isBoolean().withMessage('ban must be a boolean'),
    body('userId')
      .trim()
      .notEmpty()
      .withMessage('userId is required when banning a user')
      .isMongoId()
      .withMessage('userId must be a valid Mongo ID format'),
    body('reason').custom((value) => {
      if (value === '') return true;
      if (typeof value !== 'string' || value.trim().length < 5) {
        throw new Error('Reason should be at least 5 characters');
      }
      return true;
    }),
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
    body('role', 'Invalid role').isIn(['ADMIN', 'USER']),
  ],
  updateUser
);

router.delete(
  '/:userId',
  [
    param('userId')
      .trim()
      .notEmpty()
      .withMessage('User ID is required')
      .isMongoId()
      .withMessage('Invalid User ID format'),
  ],
  deleteUser
);

export default router;
