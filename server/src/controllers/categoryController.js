import * as categoryService from '../services/categoryService.js';
import asyncHandler from '../middleware/asyncHandler.js';
import { successResponse } from '../utils/apiResponse.js';

export const getCategories = asyncHandler(async (req, res) => {
  const categories = await categoryService.getCategories({
    search: req.query.search,
  });

  return successResponse(res, 200, 'Categories retrieved successfully', {
    categories,
  });
});

export const getCategoryById = asyncHandler(async (req, res) => {
  const category = await categoryService.getCategoryById(req.params.id);

  return successResponse(res, 200, 'Category retrieved successfully', {
    category,
  });
});

export const getCategoryBySlug = asyncHandler(async (req, res) => {
  const category = await categoryService.getCategoryBySlug(req.params.slug);

  return successResponse(res, 200, 'Category retrieved successfully', {
    category,
  });
});

export const createCategory = asyncHandler(async (req, res) => {
  const category = await categoryService.createCategory(req.body);

  return successResponse(res, 201, 'Category created successfully', {
    category,
  });
});

export const updateCategory = asyncHandler(async (req, res) => {
  const category = await categoryService.updateCategory(req.params.id, req.body);

  return successResponse(res, 200, 'Category updated successfully', {
    category,
  });
});

export const deleteCategory = asyncHandler(async (req, res) => {
  await categoryService.deleteCategory(req.params.id);

  return successResponse(res, 200, 'Category deleted successfully');
});
