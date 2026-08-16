import asyncHandler from '../middleware/asyncHandler.js';
import * as contactService from '../services/contactService.js';
import { successResponse } from '../utils/apiResponse.js';

export const sendMessage = asyncHandler(async (req, res) => {
  await contactService.sendContactMessage(req.body);

  return successResponse(res, 200, 'Your message has been sent successfully.');
});
