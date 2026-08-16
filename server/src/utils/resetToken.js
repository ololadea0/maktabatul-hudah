import crypto from 'crypto';

export const hashToken = (token) =>
  crypto.createHash('sha256').update(token).digest('hex');

export const createResetToken = () => {
  const token = crypto.randomBytes(32).toString('hex');

  return {
    token,
    hashedToken: hashToken(token),
    expiresAt: new Date(Date.now() + 60 * 60 * 1000),
  };
};
