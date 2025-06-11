import { Router } from 'express';
import { body } from 'express-validator';
import { getAllUsers, updateUser } from '../../controllers/admin/user';

const router = Router();

router.get('/', getAllUsers);

router.put(
  '/',
  [
    body('ban').isBoolean().withMessage('ban must be a boolean'),
    body('userId')
      .trim()
      .notEmpty()
      .withMessage('userId is required when banning a user')
      .isMongoId()
      .withMessage('userId must be a valid Mongo ID format'),
    body('reason')
      .optional()
      .isString()
      .trim()
      .isLength({ min: 5 })
      .withMessage('Reason should be at least 5 characters'),
  ],
  updateUser
);

export default router;
