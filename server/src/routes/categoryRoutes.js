import express from 'express';
import * as categoryController from '../controllers/categoryController.js';
import { authenticate, authorize } from '../middleware/authMiddleware.js';
import validateRequest from '../middleware/validateRequest.js';
import {
  categoryIdValidator,
  categorySlugValidator,
  createCategoryValidator,
  listCategoriesValidator,
  updateCategoryValidator,
} from '../validators/categoryValidator.js';

const router = express.Router();

router.get(
  '/',
  listCategoriesValidator,
  validateRequest,
  categoryController.getCategories,
);

router.get(
  '/slug/:slug',
  categorySlugValidator,
  validateRequest,
  categoryController.getCategoryBySlug,
);

router.get(
  '/:id',
  categoryIdValidator,
  validateRequest,
  categoryController.getCategoryById,
);

router.post(
  '/',
  authenticate,
  authorize('ADMIN'),
  createCategoryValidator,
  validateRequest,
  categoryController.createCategory,
);

router.put(
  '/:id',
  authenticate,
  authorize('ADMIN'),
  updateCategoryValidator,
  validateRequest,
  categoryController.updateCategory,
);

router.delete(
  '/:id',
  authenticate,
  authorize('ADMIN'),
  categoryIdValidator,
  validateRequest,
  categoryController.deleteCategory,
);

export default router;
