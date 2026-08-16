import bcrypt from 'bcrypt';
import prisma from '../config/db.js';
import AppError from '../utils/appError.js';
import { createResetToken, hashToken } from '../utils/resetToken.js';
import { sendForgotPasswordEmail } from './emailService.js';

const SALT_ROUNDS = 12;

const userSelect = {
  id: true,
  fullName: true,
  email: true,
  provider: true,
  googleId: true,
  avatar: true,
  role: true,
  createdAt: true,
  updatedAt: true,
};

const sanitizeUser = (user) => {
  if (!user) {
    return null;
  }

  const { password, resetPasswordToken, resetPasswordExpires, ...safeUser } = user;
  return safeUser;
};

export const register = async ({ fullName, email, password }) => {
  const existingUser = await prisma.user.findUnique({ where: { email } });

  if (existingUser) {
    throw new AppError('Email is already registered', 409);
  }

  const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);

  const user = await prisma.user.create({
    data: {
      fullName,
      email,
      password: hashedPassword,
      provider: 'LOCAL',
    },
    select: userSelect,
  });

  return user;
};

export const login = async ({ email, password }) => {
  const user = await prisma.user.findUnique({ where: { email } });

  if (!user || !user.password) {
    throw new AppError('Invalid email or password', 401);
  }

  const passwordMatches = await bcrypt.compare(password, user.password);

  if (!passwordMatches) {
    throw new AppError('Invalid email or password', 401);
  }

  return sanitizeUser(user);
};

export const changePassword = async (userId, { currentPassword, password }) => {
  const user = await prisma.user.findUnique({ where: { id: userId } });

  if (!user || !user.password) {
    throw new AppError('Password changes are only available for local accounts', 400);
  }

  const passwordMatches = await bcrypt.compare(currentPassword, user.password);

  if (!passwordMatches) {
    throw new AppError('Current password is incorrect', 400);
  }

  const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);

  const updatedUser = await prisma.user.update({
    where: { id: userId },
    data: { password: hashedPassword },
    select: userSelect,
  });

  return updatedUser;
};

export const forgotPassword = async (email) => {
  const user = await prisma.user.findUnique({ where: { email } });

  if (!user) {
    return;
  }

  const { token, hashedToken, expiresAt } = createResetToken();

  await prisma.user.update({
    where: { email },
    data: {
      resetPasswordToken: hashedToken,
      resetPasswordExpires: expiresAt,
    },
  });

  await sendForgotPasswordEmail(email, token);
};

export const resetPassword = async (token, password) => {
  const hashedToken = hashToken(token);

  const user = await prisma.user.findFirst({
    where: {
      resetPasswordToken: hashedToken,
      resetPasswordExpires: {
        gt: new Date(),
      },
    },
  });

  if (!user) {
    throw new AppError('Reset token is invalid or has expired', 400);
  }

  const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);

  const updatedUser = await prisma.user.update({
    where: { id: user.id },
    data: {
      password: hashedPassword,
      provider: 'LOCAL',
      resetPasswordToken: null,
      resetPasswordExpires: null,
    },
    select: userSelect,
  });

  return updatedUser;
};

export const findOrCreateGoogleUser = async (profile) => {
  const email = profile.emails?.[0]?.value?.toLowerCase();

  if (!email) {
    throw new AppError('Google account does not expose an email address', 400);
  }

  const googleId = profile.id;
  const avatar = profile.photos?.[0]?.value || null;
  const fullName = profile.displayName || email.split('@')[0];

  const userByGoogleId = await prisma.user.findUnique({
    where: { googleId },
    select: userSelect,
  });

  if (userByGoogleId) {
    return userByGoogleId;
  }

  const existingUser = await prisma.user.findUnique({ where: { email } });

  if (existingUser) {
    return prisma.user.update({
      where: { id: existingUser.id },
      data: {
        provider: 'GOOGLE',
        googleId,
        avatar,
      },
      select: userSelect,
    });
  }

  return prisma.user.create({
    data: {
      fullName,
      email,
      provider: 'GOOGLE',
      googleId,
      avatar,
    },
    select: userSelect,
  });
};
