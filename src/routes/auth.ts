import { Router } from 'express';
import {
  emailVerification,
  forgetPassword,
  login,
  logout,
  resetPassword,
  sentEmailForForgetPassword,
} from '../controllers/auth';
import { protect } from '../middlewares/protect';
import {
  emailVerificaitonValidator,
  forgetPasswordEmailValidator,
  forgetPasswordValidator,
  loginValidator,
  registerValidator,
  resetPasswordValidator,
} from '../validations/authValidation';
import { register } from './../controllers/auth';

const router = Router();

router.post('/register', registerValidator, register);
router.post('/login', loginValidator, login);
router.post('/logout', logout);
router.post(
  '/forget',
  forgetPasswordEmailValidator,
  sentEmailForForgetPassword
);
router.post('/forget-password', forgetPasswordValidator, forgetPassword);
router.post('/reset-password', protect, resetPasswordValidator, resetPassword);
router.post('/verify-email', emailVerificaitonValidator, emailVerification);

export default router;
