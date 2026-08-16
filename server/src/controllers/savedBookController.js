import asyncHandler from '../middleware/asyncHandler.js';
import * as savedBookService from '../services/savedBookService.js';
import { successResponse } from '../utils/apiResponse.js';

export const saveBook = asyncHandler(async (req, res) => {
  await savedBookService.saveBook({
    userId: req.user.id,
    bookId: req.params.id,
  });

  return successResponse(res, 200, 'Book saved successfully.');
});

export const unsaveBook = asyncHandler(async (req, res) => {
  await savedBookService.unsaveBook({
    userId: req.user.id,
    bookId: req.params.id,
  });

  return successResponse(res, 200, 'Book removed from saved books.');
});

export const getSaveStatus = asyncHandler(async (req, res) => {
  const status = await savedBookService.getSaveStatus({
    userId: req.user.id,
    bookId: req.params.id,
  });

  return successResponse(res, 200, 'Save status retrieved successfully', status);
});

export const getSavedBooks = asyncHandler(async (req, res) => {
  const books = await savedBookService.getSavedBooks(req.user.id);

  return successResponse(res, 200, 'Saved books retrieved successfully', {
    books,
  });
});
