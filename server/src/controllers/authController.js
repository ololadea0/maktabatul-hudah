import env from '../config/env.js';
import * as authService from '../services/authService.js';
import asyncHandler from '../middleware/asyncHandler.js';
import AppError from '../utils/appError.js';
import { successResponse } from '../utils/apiResponse.js';
import { signToken, setAuthCookie, clearAuthCookie } from '../utils/jwt.js';

const sendAuthResponse = (res, statusCode, message, user) => {
  const token = signToken({ id: user.id, role: user.role });
  setAuthCookie(res, token);

  return successResponse(res, statusCode, message, {
    user,
    token,
  });
};

export const register = asyncHandler(async (req, res) => {
  const user = await authService.register(req.body);
  return sendAuthResponse(res, 201, 'Registration successful', user);
});

export const login = asyncHandler(async (req, res) => {
  const user = await authService.login(req.body);
  return sendAuthResponse(res, 200, 'Login successful', user);
});

export const logout = asyncHandler(async (_req, res) => {
  clearAuthCookie(res);
  return successResponse(res, 200, 'Logout successful');
});

export const me = asyncHandler(async (req, res) =>
  successResponse(res, 200, 'Authenticated user retrieved', {
    user: req.user,
  }),
);

export const changePassword = asyncHandler(async (req, res) => {
  const user = await authService.changePassword(req.user.id, req.body);
  return successResponse(res, 200, 'Password changed successfully', { user });
});

export const forgotPassword = asyncHandler(async (req, res) => {
  await authService.forgotPassword(req.body.email);
  return successResponse(
    res,
    200,
    'If an account exists for this email, a password reset link has been sent',
  );
});

export const resetPassword = asyncHandler(async (req, res) => {
  const user = await authService.resetPassword(req.params.token, req.body.password);
  return sendAuthResponse(res, 200, 'Password reset successful', user);
});

export const googleCallback = asyncHandler(async (req, res) => {
  if (!req.user) {
    throw new AppError('Google authentication failed', 401);
  }

  const token = signToken({ id: req.user.id, role: req.user.role });
  setAuthCookie(res, token);

  return res.redirect(`${env.frontendUrl}/auth/google/success`);
});
