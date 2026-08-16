import express from 'express';
import passport from '../config/passport.js';
import * as authController from '../controllers/authController.js';
import validateRequest from '../middleware/validateRequest.js';
import { authenticate } from '../middleware/authMiddleware.js';
import {
  registerValidator,
  loginValidator,
  changePasswordValidator,
  forgotPasswordValidator,
  resetPasswordValidator,
} from '../validators/authValidators.js';

const router = express.Router();

router.post('/register', registerValidator, validateRequest, authController.register);
router.post('/login', loginValidator, validateRequest, authController.login);
router.post('/logout', authController.logout);
router.get('/me', authenticate, authController.me);
router.put(
  '/change-password',
  authenticate,
  changePasswordValidator,
  validateRequest,
  authController.changePassword,
);
router.post(
  '/forgot-password',
  forgotPasswordValidator,
  validateRequest,
  authController.forgotPassword,
);
router.post(
  '/reset-password/:token',
  resetPasswordValidator,
  validateRequest,
  authController.resetPassword,
);

router.get(
  '/google',
  passport.authenticate('google', {
    scope: ['profile', 'email'],
    session: false,
  }),
);

router.get(
  '/google/callback',
  passport.authenticate('google', {
    failureRedirect: '/api/auth/google/failure',
    session: false,
  }),
  authController.googleCallback,
);

router.get('/google/failure', (_req, res) =>
  res.status(401).json({
    success: false,
    message: 'Google authentication failed',
    errors: [],
  }),
);

export default router;
