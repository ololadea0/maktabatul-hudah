import prisma from '../config/db.js';
import env from '../config/env.js';
import { sendNewsletterEmail } from '../utils/email.js';
import AppError from '../utils/appError.js';
import {
  getTextFromNewsletterContent,
  sanitizeNewsletterContent,
} from '../utils/newsletterSanitizer.js';
import { createUnsubscribeToken } from '../utils/unsubscribeToken.js';

const SEND_BATCH_SIZE = 20;

const sanitizePayload = ({ subject, content }) => {
  const normalizedSubject = subject?.trim();
  const sanitizedContent = sanitizeNewsletterContent(content);

  if (!normalizedSubject) {
    throw new AppError('Newsletter subject is required', 422);
  }

  if (!getTextFromNewsletterContent(sanitizedContent)) {
    throw new AppError('Newsletter content is required', 422);
  }

  return {
    subject: normalizedSubject,
    content: sanitizedContent,
  };
};

export const createNewsletter = async (payload) => {
  const data = sanitizePayload(payload);

  return prisma.newsletter.create({ data });
};

export const listNewsletters = async () =>
  prisma.newsletter.findMany({
    orderBy: { createdAt: 'desc' },
  });

export const getNewsletter = async (id) => {
  const newsletter = await prisma.newsletter.findUnique({ where: { id } });

  if (!newsletter) {
    throw new AppError('Newsletter not found', 404);
  }

  return newsletter;
};

export const updateNewsletter = async (id, payload) => {
  const newsletter = await getNewsletter(id);

  if (newsletter.status === 'SENT') {
    throw new AppError('Sent newsletters cannot be edited', 409);
  }

  const data = sanitizePayload(payload);

  return prisma.newsletter.update({
    where: { id },
    data,
  });
};

export const deleteNewsletter = async (id) => {
  const newsletter = await getNewsletter(id);

  if (newsletter.status === 'SENT') {
    throw new AppError('Sent newsletters cannot be deleted', 409);
  }

  await prisma.newsletter.delete({ where: { id } });
};

export const sendTestNewsletter = async ({ id, email }) => {
  const newsletter = await getNewsletter(id);
  const unsubscribeUrl = `${env.frontendUrl}/`;

  await sendNewsletterEmail({
    to: email.trim().toLowerCase(),
    subject: newsletter.subject,
    content: newsletter.content,
    unsubscribeUrl,
  });
};

export const sendNewsletter = async (id) => {
  const newsletter = await getNewsletter(id);

  if (newsletter.status === 'SENT') {
    throw new AppError('Newsletter has already been sent', 409);
  }

  const subscribers = await prisma.subscriber.findMany({
    where: { status: 'ACTIVE' },
    select: { id: true, email: true },
    orderBy: { createdAt: 'asc' },
  });

  if (!subscribers.length) {
    throw new AppError('There are no active subscribers to email', 409);
  }

  for (let index = 0; index < subscribers.length; index += SEND_BATCH_SIZE) {
    const batch = subscribers.slice(index, index + SEND_BATCH_SIZE);
    await Promise.all(
      batch.map((subscriber) =>
        sendNewsletterEmail({
          to: subscriber.email,
          subject: newsletter.subject,
          content: newsletter.content,
          unsubscribeUrl: `${env.apiUrl}/api/subscribers/unsubscribe?token=${createUnsubscribeToken(subscriber.id)}`,
        }),
      ),
    );
  }

  return prisma.newsletter.update({
    where: { id },
    data: {
      status: 'SENT',
      sentAt: new Date(),
      recipientCount: subscribers.length,
    },
  });
};

export const getActiveSubscriberCount = () =>
  prisma.subscriber.count({ where: { status: 'ACTIVE' } });
