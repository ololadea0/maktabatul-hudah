import { body, param } from 'express-validator';

export const newsletterIdValidator = [
  param('id').notEmpty().withMessage('Newsletter id is required'),
];

export const saveNewsletterValidator = [
  body('subject')
    .trim()
    .notEmpty()
    .withMessage('Subject is required')
    .isLength({ max: 180 })
    .withMessage('Subject must be at most 180 characters long'),
  body('content').notEmpty().withMessage('Message is required'),
];

export const sendTestNewsletterValidator = [
  ...newsletterIdValidator,
  body('email')
    .trim()
    .notEmpty()
    .withMessage('Test email is required')
    .isEmail()
    .withMessage('Please provide a valid test email')
    .normalizeEmail(),
];
