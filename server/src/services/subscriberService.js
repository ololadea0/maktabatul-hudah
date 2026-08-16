import prisma from '../config/db.js';
import AppError from '../utils/appError.js';
import { parseUnsubscribeToken } from '../utils/unsubscribeToken.js';

const normalizeEmail = (email) => email.trim().toLowerCase();

export const subscribe = async ({ email }) => {
  const normalizedEmail = normalizeEmail(email);
  const existing = await prisma.subscriber.findUnique({
    where: { email: normalizedEmail },
  });

  if (existing?.status === 'ACTIVE') {
    return { reactivated: false };
  }

  if (existing) {
    await prisma.subscriber.update({
      where: { id: existing.id },
      data: { status: 'ACTIVE' },
    });
    return { reactivated: true };
  }

  await prisma.subscriber.create({
    data: { email: normalizedEmail },
  });

  return { reactivated: false };
};

export const unsubscribeByToken = async (token) => {
  const subscriberId = parseUnsubscribeToken(token);

  if (!subscriberId) {
    throw new AppError('Invalid unsubscribe link', 400);
  }

  const subscriber = await prisma.subscriber.findUnique({
    where: { id: subscriberId },
  });

  if (!subscriber) {
    throw new AppError('Subscriber not found', 404);
  }

  await prisma.subscriber.update({
    where: { id: subscriber.id },
    data: { status: 'UNSUBSCRIBED' },
  });
};

export const listSubscribers = async ({ search = '', status, page = 1, limit = 25 }) => {
  const safePage = Math.max(Number(page) || 1, 1);
  const safeLimit = Math.min(Math.max(Number(limit) || 25, 1), 100);
  const where = {
    ...(status ? { status } : {}),
    ...(search
      ? {
          email: {
            contains: search.trim().toLowerCase(),
            mode: 'insensitive',
          },
        }
      : {}),
  };

  const [subscribers, total, active, unsubscribed] = await prisma.$transaction([
    prisma.subscriber.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      skip: (safePage - 1) * safeLimit,
      take: safeLimit,
      select: {
        id: true,
        email: true,
        status: true,
        createdAt: true,
        updatedAt: true,
      },
    }),
    prisma.subscriber.count({ where }),
    prisma.subscriber.count({ where: { status: 'ACTIVE' } }),
    prisma.subscriber.count({ where: { status: 'UNSUBSCRIBED' } }),
  ]);

  return {
    subscribers,
    stats: {
      active,
      unsubscribed,
      total: active + unsubscribed,
    },
    pagination: {
      page: safePage,
      limit: safeLimit,
      total,
      pages: Math.ceil(total / safeLimit) || 1,
    },
  };
};
