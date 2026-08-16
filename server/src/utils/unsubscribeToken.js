import crypto from 'node:crypto';
import env from '../config/env.js';

const getSecret = () => env.jwtSecret || env.resendApiKey || 'al-ilm-newsletter-dev-secret';

const sign = (subscriberId) =>
  crypto.createHmac('sha256', getSecret()).update(subscriberId).digest('base64url');

export const createUnsubscribeToken = (subscriberId) =>
  Buffer.from(`${subscriberId}.${sign(subscriberId)}`, 'utf8').toString('base64url');

export const parseUnsubscribeToken = (token) => {
  try
  {
    const decoded = Buffer.from(token, 'base64url').toString('utf8');
    const separatorIndex = decoded.indexOf('.');

    if (separatorIndex < 1)
    {
      return null;
    }

    const subscriberId = decoded.slice(0, separatorIndex);
    const signature = decoded.slice(separatorIndex + 1);
    const expected = sign(subscriberId);

    if (
      signature.length !== expected.length ||
      !crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expected))
    )
    {
      return null;
    }

    return subscriberId;
  } catch (_error)
  {
    return null;
  }
};
