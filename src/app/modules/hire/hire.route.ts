import { Router } from 'express';
import validateRequest from '../../middleware/validateRequest';
import auth from '../../middleware/auth';
import isVerified from '../../middleware/isVerified';
import { HireController } from './hire.controller';
import { hireStatusValidationSchema, hireValidationSchema } from './hire.validation';

const router = Router();

// Create a new hire request (open to all, including unauthenticated users)
router.post('/', validateRequest(hireValidationSchema), HireController.createHireRequest);

// View all hire requests (admin only)
router.get('/', auth('admin'), isVerified, HireController.getAllHireRequests);

// Update hire request status (admin only)
router.patch(
  '/:id/status',
  auth('admin'),
  isVerified,
  validateRequest(hireStatusValidationSchema),
  HireController.updateHireRequestStatus
);

export const HireRoutes = router;