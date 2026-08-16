import { body, param, query } from 'express-validator';

const slugRule = (field) =>
  field
    .optional()
    .trim()
    .matches(/^[a-z0-9]+(?:-[a-z0-9]+)*$/)
    .withMessage('Slug must contain lowercase letters, numbers, and hyphens only');

export const createBookValidator = [
  body('title')
    .trim()
    .notEmpty()
    .withMessage('Book title is required')
    .isLength({ max: 180 })
    .withMessage('Book title must be at most 180 characters long'),
  slugRule(body('slug')),
  body('author')
    .trim()
    .notEmpty()
    .withMessage('Author is required')
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
    .isLength({ max: 5000 })
    .withMessage('About the book must be at most 5000 characters long'),
  body('isbn')
    .optional({ nullable: true, checkFalsy: true })
    .trim()
    .isLength({ max: 32 })
    .withMessage('ISBN must be at most 32 characters long'),
  body('coverImage').optional({ nullable: true, checkFalsy: true }).trim(),
  body('pdfUrl').optional({ nullable: true, checkFalsy: true }).trim(),
  body('language')
    .optional()
    .trim()
    .isLength({ max: 60 })
    .withMessage('Language must be at most 60 characters long'),
  body('publisher')
    .optional({ nullable: true })
    .trim()
    .isLength({ max: 120 })
    .withMessage('Publisher must be at most 120 characters long'),
  body('publicationYear')
    .optional({ nullable: true, checkFalsy: true })
    .isInt({ min: 1, max: new Date().getFullYear() + 1 })
    .withMessage('Publication year must be a valid year')
    .toInt(),
  body('pages')
    .optional({ nullable: true, checkFalsy: true })
    .isInt({ min: 1 })
    .withMessage('Pages must be a positive number')
    .toInt(),
  body('volumeSet')
    .optional({ nullable: true })
    .trim()
    .isLength({ max: 180 })
    .withMessage('Volume set must be at most 180 characters long'),
  body('volumeNumber')
    .optional({ nullable: true, checkFalsy: true })
    .isInt({ min: 1 })
    .withMessage('Volume number must be a positive number')
    .toInt(),
  body('totalVolumes')
    .optional({ nullable: true, checkFalsy: true })
    .isInt({ min: 1 })
    .withMessage('Total volumes must be a positive number')
    .toInt(),
  body('collectionId')
    .optional({ nullable: true, checkFalsy: true })
    .trim()
    .notEmpty()
    .withMessage('Collection id cannot be empty'),
  body('fileSize')
    .optional({ nullable: true, checkFalsy: true })
    .isInt({ min: 1 })
    .withMessage('File size must be a positive number')
    .toInt(),
  body('isPublished')
    .optional()
    .isBoolean()
    .withMessage('isPublished must be true or false')
    .toBoolean(),
  body('categoryId')
    .trim()
    .notEmpty()
    .withMessage('Category id is required'),
];

export const updateBookValidator = [
  param('id').notEmpty().withMessage('Book id is required'),
  body('title')
    .optional()
    .trim()
    .notEmpty()
    .withMessage('Book title cannot be empty')
    .isLength({ max: 180 })
    .withMessage('Book title must be at most 180 characters long'),
  slugRule(body('slug')),
  body('author')
    .optional()
    .trim()
    .notEmpty()
    .withMessage('Author cannot be empty')
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
    .isLength({ max: 5000 })
    .withMessage('About the book must be at most 5000 characters long'),
  body('isbn')
    .optional({ nullable: true, checkFalsy: true })
    .trim()
    .isLength({ max: 32 })
    .withMessage('ISBN must be at most 32 characters long'),
  body('coverImage').optional({ nullable: true, checkFalsy: true }).trim(),
  body('pdfUrl').optional({ nullable: true, checkFalsy: true }).trim(),
  body('language')
    .optional()
    .trim()
    .isLength({ max: 60 })
    .withMessage('Language must be at most 60 characters long'),
  body('publisher')
    .optional({ nullable: true })
    .trim()
    .isLength({ max: 120 })
    .withMessage('Publisher must be at most 120 characters long'),
  body('publicationYear')
    .optional({ nullable: true, checkFalsy: true })
    .isInt({ min: 1, max: new Date().getFullYear() + 1 })
    .withMessage('Publication year must be a valid year')
    .toInt(),
  body('pages')
    .optional({ nullable: true, checkFalsy: true })
    .isInt({ min: 1 })
    .withMessage('Pages must be a positive number')
    .toInt(),
  body('volumeSet')
    .optional({ nullable: true })
    .trim()
    .isLength({ max: 180 })
    .withMessage('Volume set must be at most 180 characters long'),
  body('volumeNumber')
    .optional({ nullable: true, checkFalsy: true })
    .isInt({ min: 1 })
    .withMessage('Volume number must be a positive number')
    .toInt(),
  body('totalVolumes')
    .optional({ nullable: true, checkFalsy: true })
    .isInt({ min: 1 })
    .withMessage('Total volumes must be a positive number')
    .toInt(),
  body('collectionId')
    .optional({ nullable: true, checkFalsy: true })
    .trim()
    .notEmpty()
    .withMessage('Collection id cannot be empty'),
  body('fileSize')
    .optional({ nullable: true, checkFalsy: true })
    .isInt({ min: 1 })
    .withMessage('File size must be a positive number')
    .toInt(),
  body('isPublished')
    .optional()
    .isBoolean()
    .withMessage('isPublished must be true or false')
    .toBoolean(),
  body('categoryId')
    .optional()
    .trim()
    .notEmpty()
    .withMessage('Category id cannot be empty'),
];

export const bookIdValidator = [
  param('id').notEmpty().withMessage('Book id is required'),
];

export const readingProgressValidator = [
  param('id').notEmpty().withMessage('Book id is required'),
  body('currentPage')
    .isInt({ min: 1 })
    .withMessage('Current page must be a positive number')
    .toInt(),
  body('zoom')
    .optional()
    .isFloat({ min: 0.4, max: 3 })
    .withMessage('Zoom must be between 0.4 and 3')
    .toFloat(),
];

export const bookSlugValidator = [
  param('slug')
    .trim()
    .notEmpty()
    .withMessage('Book slug is required')
    .matches(/^[a-z0-9]+(?:-[a-z0-9]+)*$/)
    .withMessage('Invalid book slug'),
];

export const listBooksValidator = [
  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Page must be a positive number')
    .toInt(),
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Limit must be between 1 and 100')
    .toInt(),
  query('search')
    .optional()
    .trim()
    .isLength({ max: 100 })
    .withMessage('Search must be at most 100 characters long'),
  query('categoryId')
    .optional()
    .trim()
    .notEmpty()
    .withMessage('Category id cannot be empty'),
  query('categorySlug')
    .optional()
    .trim()
    .matches(/^[a-z0-9]+(?:-[a-z0-9]+)*$/)
    .withMessage('Invalid category slug'),
  query('author')
    .optional()
    .trim()
    .isLength({ max: 120 })
    .withMessage('Author must be at most 120 characters long'),
  query('language')
    .optional()
    .trim()
    .isLength({ max: 60 })
    .withMessage('Language must be at most 60 characters long'),
  query('isPublished')
    .optional()
    .isBoolean()
    .withMessage('isPublished must be true or false')
    .toBoolean(),
  query('includeCollectionVolumes')
    .optional()
    .isBoolean()
    .withMessage('includeCollectionVolumes must be true or false')
    .toBoolean(),
];
