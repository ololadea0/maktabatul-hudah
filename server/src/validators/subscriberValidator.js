import { body, query } from 'express-validator';

export const subscribeValidator = [
  body('email')
    .trim()
    .notEmpty()
    .withMessage('Email is required')
    .isEmail()
    .withMessage('Please provide a valid email')
    .normalizeEmail(),
];

export const unsubscribeValidator = [
  query('token').notEmpty().withMessage('Unsubscribe token is required'),
];

export const listSubscribersValidator = [
  query('status')
    .optional()
    .isIn(['ACTIVE', 'UNSUBSCRIBED'])
    .withMessage('Status must be ACTIVE or UNSUBSCRIBED'),
  query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive number'),
  query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100'),
];
