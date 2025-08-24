import { Router } from 'express';
import { SubscriptionController } from './subscription.controller';
import validateRequest from '../../middleware/validateRequest';
import { subscriptionValidationSchema, updateSubscriptionValidationSchema } from './subscription.validation';
import auth from '../../middleware/auth';
import isVerified from '../../middleware/isVerified';

const router = Router();

router.post('/', auth('landlord', 'admin'),isVerified, validateRequest(subscriptionValidationSchema), SubscriptionController.createSubscription);
router.get('/', auth('admin'), SubscriptionController.getSubscriptions);
router.get('/landlord', auth('landlord'), SubscriptionController.getLanloardSubscriptions);
router.get('/:id', auth('landlord', 'admin'), SubscriptionController.getSingleSubscription);
router.patch('/:id', auth('admin'), validateRequest(updateSubscriptionValidationSchema), SubscriptionController.updateSubscription);
router.delete('/:id', auth('admin'), SubscriptionController.deleteSubscription);
router.post('/:id/refund', auth('admin'), SubscriptionController.refundSubscription);

export const SubscriptionRoutes = router;