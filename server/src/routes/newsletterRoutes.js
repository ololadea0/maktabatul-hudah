import express from 'express';
import * as newsletterController from '../controllers/newsletterController.js';
import { authenticate, authorize } from '../middleware/authMiddleware.js';
import validateRequest from '../middleware/validateRequest.js';
import {
  newsletterIdValidator,
  saveNewsletterValidator,
  sendTestNewsletterValidator,
} from '../validators/newsletterValidator.js';

const router = express.Router();

router.use(authenticate, authorize('ADMIN'));

router
  .route('/')
  .get(newsletterController.listNewsletters)
  .post(saveNewsletterValidator, validateRequest, newsletterController.createNewsletter);

router
  .route('/:id')
  .get(newsletterIdValidator, validateRequest, newsletterController.getNewsletter)
  .put(
    newsletterIdValidator,
    saveNewsletterValidator,
    validateRequest,
    newsletterController.updateNewsletter,
  )
  .delete(newsletterIdValidator, validateRequest, newsletterController.deleteNewsletter);

router.post(
  '/:id/test',
  sendTestNewsletterValidator,
  validateRequest,
  newsletterController.sendTestNewsletter,
);

router.post(
  '/:id/send',
  newsletterIdValidator,
  validateRequest,
  newsletterController.sendNewsletter,
);

export default router;
