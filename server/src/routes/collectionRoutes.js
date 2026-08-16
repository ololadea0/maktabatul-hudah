import express from 'express';
import * as collectionController from '../controllers/collectionController.js';
import { authenticate, authorize, optionalAuthenticate } from '../middleware/authMiddleware.js';
import { uploadBookFiles } from '../middleware/bookUpload.js';
import validateRequest from '../middleware/validateRequest.js';
import {
  collectionIdValidator,
  createCollectionValidator,
  listCollectionsValidator,
  updateCollectionValidator,
} from '../validators/collectionValidator.js';

const router = express.Router();

const normalizeUploadedCollectionFiles = (req, _res, next) => {
  if (req.files?.coverImage?.length) {
    delete req.body.coverImage;
  }

  next();
};

router.get(
  '/',
  optionalAuthenticate,
  listCollectionsValidator,
  validateRequest,
  collectionController.getCollections,
);

router.get(
  '/:id/books',
  optionalAuthenticate,
  collectionIdValidator,
  validateRequest,
  collectionController.getCollectionBooks,
);

router.get(
  '/:id',
  optionalAuthenticate,
  collectionIdValidator,
  validateRequest,
  collectionController.getCollectionById,
);

router.post(
  '/',
  authenticate,
  authorize('ADMIN'),
  uploadBookFiles,
  normalizeUploadedCollectionFiles,
  createCollectionValidator,
  validateRequest,
  collectionController.createCollection,
);

router.put(
  '/:id',
  authenticate,
  authorize('ADMIN'),
  uploadBookFiles,
  normalizeUploadedCollectionFiles,
  updateCollectionValidator,
  validateRequest,
  collectionController.updateCollection,
);

router.delete(
  '/:id',
  authenticate,
  authorize('ADMIN'),
  collectionIdValidator,
  validateRequest,
  collectionController.deleteCollection,
);

export default router;
