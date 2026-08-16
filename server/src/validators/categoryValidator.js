import { body, param, query } from 'express-validator';

export const createCategoryValidator = [
  body('name')
    .trim()
    .notEmpty()
    .withMessage('Category name is required')
    .isLength({ max: 80 })
    .withMessage('Category name must be at most 80 characters long'),
  body('slug')
    .optional()
    .trim()
    .matches(/^[a-z0-9]+(?:-[a-z0-9]+)*$/)
    .withMessage('Slug must contain lowercase letters, numbers, and hyphens only'),
  body('description')
    .optional({ nullable: true })
    .trim()
    .isLength({ max: 500 })
    .withMessage('Description must be at most 500 characters long'),
  body('icon')
    .optional({ nullable: true })
    .trim()
    .isLength({ max: 40 })
    .withMessage('Icon must be at most 40 characters long'),
];

export const updateCategoryValidator = [
  param('id')
    .notEmpty()
    .withMessage('Category id is required'),
  body('name')
    .optional()
    .trim()
    .notEmpty()
    .withMessage('Category name cannot be empty')
    .isLength({ max: 80 })
    .withMessage('Category name must be at most 80 characters long'),
  body('slug')
    .optional()
    .trim()
    .matches(/^[a-z0-9]+(?:-[a-z0-9]+)*$/)
    .withMessage('Slug must contain lowercase letters, numbers, and hyphens only'),
  body('description')
    .optional({ nullable: true })
    .trim()
    .isLength({ max: 500 })
    .withMessage('Description must be at most 500 characters long'),
  body('icon')
    .optional({ nullable: true })
    .trim()
    .isLength({ max: 40 })
    .withMessage('Icon must be at most 40 characters long'),
];

export const categoryIdValidator = [
  param('id').notEmpty().withMessage('Category id is required'),
];

export const categorySlugValidator = [
  param('slug')
    .trim()
    .notEmpty()
    .withMessage('Category slug is required')
    .matches(/^[a-z0-9]+(?:-[a-z0-9]+)*$/)
    .withMessage('Invalid category slug'),
];

export const listCategoriesValidator = [
  query('search')
    .optional()
    .trim()
    .isLength({ max: 100 })
    .withMessage('Search must be at most 100 characters long'),
];
