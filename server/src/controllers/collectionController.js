import * as collectionService from '../services/collectionService.js';
import asyncHandler from '../middleware/asyncHandler.js';
import { successResponse } from '../utils/apiResponse.js';

const includeUnpublished = (req) => req.user?.role === 'ADMIN';

export const getCollections = asyncHandler(async (req, res) => {
  const collections = await collectionService.getCollections({
    search: req.query.search,
    includeUnpublished: includeUnpublished(req),
  });

  return successResponse(res, 200, 'Collections retrieved successfully', {
    collections,
  });
});

export const getCollectionById = asyncHandler(async (req, res) => {
  const collection = await collectionService.getCollectionById(req.params.id, {
    includeUnpublished: includeUnpublished(req),
  });

  return successResponse(res, 200, 'Collection retrieved successfully', {
    collection,
  });
});

export const getCollectionBooks = asyncHandler(async (req, res) => {
  const books = await collectionService.getCollectionBooks(req.params.id, {
    includeUnpublished: includeUnpublished(req),
  });

  return successResponse(res, 200, 'Collection books retrieved successfully', {
    books,
  });
});

export const createCollection = asyncHandler(async (req, res) => {
  const collection = await collectionService.createCollection(req.body, req.files);

  return successResponse(res, 201, 'Collection created successfully', {
    collection,
  });
});

export const updateCollection = asyncHandler(async (req, res) => {
  const collection = await collectionService.updateCollection(
    req.params.id,
    req.body,
    req.files,
  );

  return successResponse(res, 200, 'Collection updated successfully', {
    collection,
  });
});

export const deleteCollection = asyncHandler(async (req, res) => {
  await collectionService.deleteCollection(req.params.id);

  return successResponse(res, 200, 'Collection deleted successfully');
});
