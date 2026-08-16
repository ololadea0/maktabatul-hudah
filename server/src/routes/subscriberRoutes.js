import express from 'express';
import * as subscriberController from '../controllers/subscriberController.js';
import { authenticate, authorize } from '../middleware/authMiddleware.js';
import validateRequest from '../middleware/validateRequest.js';
import {
  listSubscribersValidator,
  subscribeValidator,
  unsubscribeValidator,
} from '../validators/subscriberValidator.js';

const router = express.Router();

router.post('/', subscribeValidator, validateRequest, subscriberController.subscribe);

router.get(
  '/unsubscribe',
  unsubscribeValidator,
  validateRequest,
  subscriberController.unsubscribe,
);

router.get(
  '/',
  authenticate,
  authorize('ADMIN'),
  listSubscribersValidator,
  validateRequest,
  subscriberController.listSubscribers,
);

export default router;
