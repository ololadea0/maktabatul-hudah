import env from '../config/env.js';
import { sendPasswordResetEmail } from '../utils/email.js';

export const sendForgotPasswordEmail = async (to, plainResetToken) => {
  const resetUrl = `${env.frontendUrl}/auth/reset/${plainResetToken}`;

  await sendPasswordResetEmail(to, resetUrl);
};
