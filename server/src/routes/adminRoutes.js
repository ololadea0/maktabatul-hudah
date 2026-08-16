import express from 'express';
import * as adminController from '../controllers/adminController.js';
import { authenticate, authorize } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get(
  '/dashboard',
  authenticate,
  authorize('ADMIN'),
  adminController.getDashboard,
);

export default router;
