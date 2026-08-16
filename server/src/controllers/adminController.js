import * as adminService from '../services/adminService.js';
import asyncHandler from '../middleware/asyncHandler.js';
import { successResponse } from '../utils/apiResponse.js';

export const getDashboard = asyncHandler(async (_req, res) => {
  const dashboard = await adminService.getDashboardStats();

  return successResponse(res, 200, 'Admin dashboard retrieved successfully', {
    dashboard,
  });
});
