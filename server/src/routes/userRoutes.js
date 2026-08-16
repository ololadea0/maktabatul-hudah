import express from 'express';
import * as savedBookController from '../controllers/savedBookController.js';
import { authenticate } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/me/saved-books', authenticate, savedBookController.getSavedBooks);

export default router;
