import { Router } from 'express';
import {
  checkAuth,
  deActivateAccount,
  emailVerification,
  forgetPassword,
  login,
  logout,
  resetPassword,
  sentEmailForForgetPassword,
} from '../controllers/auth';
import { protect } from '../middlewares/protect';
import {
  deActivateValidator,
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
router.post('/deactivate', deActivateValidator, deActivateAccount);

router.get('/verify-auth', protect, checkAuth);

export default router;
