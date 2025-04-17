import { Router } from 'express';
import { login, logout, register } from '../controllers/auth';
import {
  loginValidator,
  registerValidator,
} from '../validations/authValidation';

const router = Router();

router.post('/register', registerValidator, register);
router.post('/login', loginValidator, login);
router.post('/logout', logout);

export default router;
