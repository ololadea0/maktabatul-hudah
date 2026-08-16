import prisma from '../config/db.js';
import AppError from '../utils/appError.js';
import { verifyToken } from '../utils/jwt.js';

const getTokenFromRequest = (req) => {
  if (req.cookies?.token) {
    return req.cookies.token;
  }

  const authHeader = req.headers.authorization;
  if (authHeader?.startsWith('Bearer ')) {
    return authHeader.split(' ')[1];
  }

  return null;
};

export const authenticate = async (req, _res, next) => {
  try {
    const token = getTokenFromRequest(req);

    if (!token) {
      throw new AppError('Authentication required', 401);
    }

    const payload = verifyToken(token);
    const user = await prisma.user.findUnique({
      where: { id: payload.id },
      select: {
        id: true,
        fullName: true,
        email: true,
        provider: true,
        googleId: true,
        avatar: true,
        role: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!user) {
      throw new AppError('User no longer exists', 401);
    }

    req.user = user;
    return next();
  } catch (error) {
    return next(error.statusCode ? error : new AppError('Invalid or expired token', 401));
  }
};

export const optionalAuthenticate = async (req, _res, next) => {
  try {
    const token = getTokenFromRequest(req);

    if (!token) {
      return next();
    }

    const payload = verifyToken(token);
    const user = await prisma.user.findUnique({
      where: { id: payload.id },
      select: {
        id: true,
        fullName: true,
        email: true,
        provider: true,
        googleId: true,
        avatar: true,
        role: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    req.user = user || undefined;
    return next();
  } catch (_error) {
    return next();
  }
};

export const authorize = (...roles) => (req, _res, next) => {
  if (!req.user || !roles.includes(req.user.role)) {
    return next(new AppError('You are not authorized to access this resource', 403));
  }

  return next();
};
