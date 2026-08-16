import env from '../config/env.js';
import AppError from '../utils/appError.js';
import { sendContactEmail } from '../utils/email.js';

const normalizeText = (value) => String(value || '').trim().replace(/\r\n/g, '\n');

export const sendContactMessage = async ({ name, email, subject, message }) => {
  if (!env.contactEmail) {
    throw new AppError('Contact email is not configured', 500);
  }

  const contactMessage = {
    name: normalizeText(name),
    email: normalizeText(email).toLowerCase(),
    subject: normalizeText(subject),
    message: normalizeText(message),
  };

  await sendContactEmail({
    to: env.contactEmail,
    ...contactMessage,
  });

  return contactMessage;
};
