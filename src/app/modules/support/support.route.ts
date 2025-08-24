import { Router } from 'express';
import { SupportController } from './support.controller';
import validateRequest from '../../middleware/validateRequest';
import { supportValidationSchema, supportStatusValidationSchema } from './support.validation';
import auth from '../../middleware/auth';
import isVerified from '../../middleware/isVerified';

const router = Router();

router.post('/', validateRequest(supportValidationSchema), SupportController.createSupportMessage);
router.post('/user',auth('tenant', 'landlord'), validateRequest(supportValidationSchema), SupportController.createSupportMessage);
router.get('/my-messages', auth('tenant', 'landlord'), isVerified, SupportController.getUserSupportMessages);
router.get('/', auth('admin'), isVerified, SupportController.getAllSupportMessages);
router.patch(
  '/:id/status',
  auth('admin'),
  isVerified,
  validateRequest(supportStatusValidationSchema),
  SupportController.updateSupportMessageStatus
);

export const SupportRoutes = router;