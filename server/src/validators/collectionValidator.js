import { body, param, query } from 'express-validator';

export const listCollectionsValidator = [
  query('search')
    .optional()
    .trim()
    .isLength({ max: 100 })
    .withMessage('Search must be at most 100 characters long'),
];

export const collectionIdValidator = [
  param('id').notEmpty().withMessage('Collection id is required'),
];

export const createCollectionValidator = [
  body('title')
    .trim()
    .notEmpty()
    .withMessage('Collection title is required')
    .isLength({ max: 180 })
    .withMessage('Collection title must be at most 180 characters long'),
  body('author')
    .optional({ nullable: true })
    .trim()
    .isLength({ max: 120 })
    .withMessage('Author must be at most 120 characters long'),
  body('description')
    .optional({ nullable: true })
    .trim()
    .isLength({ max: 2000 })
    .withMessage('Description must be at most 2000 characters long'),
  body('about')
    .optional({ nullable: true })
    .trim()
    .isLength({ max: 4000 })
    .withMessage('About must be at most 4000 characters long'),
  body('totalVolumes')
    .optional({ nullable: true })
    .isInt({ min: 1 })
    .withMessage('Total volumes must be a positive integer'),
  body('language')
    .optional({ nullable: true })
    .trim()
    .isLength({ max: 60 })
    .withMessage('Language must be at most 60 characters long'),
  body('coverImage').optional({ nullable: true, checkFalsy: true }).trim(),
];

export const updateCollectionValidator = [
  ...collectionIdValidator,
  body('title')
    .optional()
    .trim()
    .notEmpty()
    .withMessage('Collection title cannot be empty')
    .isLength({ max: 180 })
    .withMessage('Collection title must be at most 180 characters long'),
  body('author')
    .optional({ nullable: true })
    .trim()
    .isLength({ max: 120 })
    .withMessage('Author must be at most 120 characters long'),
  body('description')
    .optional({ nullable: true })
    .trim()
    .isLength({ max: 2000 })
    .withMessage('Description must be at most 2000 characters long'),
  body('about')
    .optional({ nullable: true })
    .trim()
    .isLength({ max: 4000 })
    .withMessage('About must be at most 4000 characters long'),
  body('language')
    .optional({ nullable: true })
    .trim()
    .isLength({ max: 60 })
    .withMessage('Language must be at most 60 characters long'),
  body('coverImage').optional({ nullable: true, checkFalsy: true }).trim(),
];
