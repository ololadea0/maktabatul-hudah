import express from 'express';
import * as contactController from '../controllers/contactController.js';
import validateRequest from '../middleware/validateRequest.js';
import { contactValidator } from '../validators/contactValidator.js';

const router = express.Router();

const contactAttempts = new Map();
const WINDOW_MS = 15 * 60 * 1000;
const MAX_ATTEMPTS = 5;

const contactRateLimit = (req, res, next) => {
  const key = req.ip || req.headers['x-forwarded-for'] || 'unknown';
  const now = Date.now();
  const record = contactAttempts.get(key);

  if (!record || record.resetAt <= now) {
    contactAttempts.set(key, { count: 1, resetAt: now + WINDOW_MS });
    return next();
  }

  if (record.count >= MAX_ATTEMPTS) {
    return res.status(429).json({
      success: false,
      message: 'Too many contact attempts. Please try again later.',
      errors: [],
    });
  }

  record.count += 1;
  contactAttempts.set(key, record);
  return next();
};

router.post('/', contactRateLimit, contactValidator, validateRequest, contactController.sendMessage);

export default router;
