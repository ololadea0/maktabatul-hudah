import express from 'express';
import * as bookController from '../controllers/bookController.js';
import * as savedBookController from '../controllers/savedBookController.js';
import { authenticate, authorize } from '../middleware/authMiddleware.js';
import { uploadBookFiles } from '../middleware/bookUpload.js';
import validateRequest from '../middleware/validateRequest.js';
import {
  bookIdValidator,
  bookSlugValidator,
  createBookValidator,
  listBooksValidator,
  readingProgressValidator,
  updateBookValidator,
} from '../validators/bookValidator.js';

const router = express.Router();

const normalizeUploadedBookFiles = (req, _res, next) => {
  if (req.files?.coverImage?.length) {
    delete req.body.coverImage;
  }

  if (req.files?.pdf?.length) {
    delete req.body.pdfUrl;
  }

  next();
};

router.get(
  '/',
  listBooksValidator,
  validateRequest,
  bookController.getBooks,
);

router.get('/stats', bookController.getLibraryStats);

router.get(
  '/slug/:slug',
  bookSlugValidator,
  validateRequest,
  bookController.getBookBySlug,
);

router.get(
  '/:id/reader',
  authenticate,
  bookIdValidator,
  validateRequest,
  bookController.getReaderInfo,
);

router.get(
  '/:id/progress',
  authenticate,
  bookIdValidator,
  validateRequest,
  bookController.getReadingProgress,
);

router.put(
  '/:id/progress',
  authenticate,
  readingProgressValidator,
  validateRequest,
  bookController.saveReadingProgress,
);

router.get(
  '/:id/save-status',
  authenticate,
  bookIdValidator,
  validateRequest,
  savedBookController.getSaveStatus,
);

router.post(
  '/:id/save',
  authenticate,
  bookIdValidator,
  validateRequest,
  savedBookController.saveBook,
);

router.delete(
  '/:id/save',
  authenticate,
  bookIdValidator,
  validateRequest,
  savedBookController.unsaveBook,
);

router.get(
  '/:id/pdf',
  bookIdValidator,
  validateRequest,
  bookController.streamBookPdf,
);

router.get(
  '/:id',
  bookIdValidator,
  validateRequest,
  bookController.getBookById,
);

router.post(
  '/:id/download',
  bookIdValidator,
  validateRequest,
  bookController.downloadBook,
);

router.post(
  '/',
  authenticate,
  authorize('ADMIN'),
  uploadBookFiles,
  normalizeUploadedBookFiles,
  createBookValidator,
  validateRequest,
  bookController.createBook,
);

router.put(
  '/:id',
  authenticate,
  authorize('ADMIN'),
  uploadBookFiles,
  normalizeUploadedBookFiles,
  updateBookValidator,
  validateRequest,
  bookController.updateBook,
);

router.delete(
  '/:id',
  authenticate,
  authorize('ADMIN'),
  bookIdValidator,
  validateRequest,
  bookController.deleteBook,
);

export default router;
