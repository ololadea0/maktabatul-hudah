import asyncHandler from '../middleware/asyncHandler.js';
import * as newsletterService from '../services/newsletterService.js';
import { successResponse } from '../utils/apiResponse.js';

export const createNewsletter = asyncHandler(async (req, res) => {
  const newsletter = await newsletterService.createNewsletter(req.body);

  return successResponse(res, 201, 'Newsletter draft created successfully', {
    newsletter,
  });
});

export const listNewsletters = asyncHandler(async (_req, res) => {
  const [newsletters, activeSubscriberCount] = await Promise.all([
    newsletterService.listNewsletters(),
    newsletterService.getActiveSubscriberCount(),
  ]);

  return successResponse(res, 200, 'Newsletters retrieved successfully', {
    newsletters,
    activeSubscriberCount,
  });
});

export const getNewsletter = asyncHandler(async (req, res) => {
  const newsletter = await newsletterService.getNewsletter(req.params.id);

  return successResponse(res, 200, 'Newsletter retrieved successfully', {
    newsletter,
  });
});

export const updateNewsletter = asyncHandler(async (req, res) => {
  const newsletter = await newsletterService.updateNewsletter(req.params.id, req.body);

  return successResponse(res, 200, 'Newsletter updated successfully', {
    newsletter,
  });
});

export const deleteNewsletter = asyncHandler(async (req, res) => {
  await newsletterService.deleteNewsletter(req.params.id);

  return successResponse(res, 200, 'Newsletter deleted successfully');
});

export const sendTestNewsletter = asyncHandler(async (req, res) => {
  await newsletterService.sendTestNewsletter({
    id: req.params.id,
    email: req.body.email,
  });

  return successResponse(res, 200, 'Test newsletter sent successfully');
});

export const sendNewsletter = asyncHandler(async (req, res) => {
  const newsletter = await newsletterService.sendNewsletter(req.params.id);

  return successResponse(res, 200, 'Newsletter sent successfully', {
    newsletter,
  });
});
