import { Router } from 'express';
import { PropertyController } from './property.controller';
import validateRequest from '../../middleware/validateRequest';
import { propertyValidationSchema, updatePropertyValidationSchema, updatePropertyStatusValidationSchema, acceptRejectPropertyValidationSchema } from './property.validation';
import auth from '../../middleware/auth';
import isVerified from '../../middleware/isVerified';

const router = Router();

router.post('/', auth('landlord', 'admin'),isVerified, validateRequest(propertyValidationSchema), PropertyController.createProperty);
router.get('/', PropertyController.getProperties);
router.get('/active', PropertyController.getActiveProperties);
router.get('/my-properties', auth('landlord'), PropertyController.getLandlordProperties);
router.get('/:id', PropertyController.getSingleProperty);
router.get('/:id/with-reviews', PropertyController.getPropertyWithReviews);
router.patch('/:id', auth('landlord', 'admin'),isVerified, validateRequest(updatePropertyValidationSchema), PropertyController.updateProperty);
router.patch('/:id/status', auth('admin', 'landlord'),isVerified, validateRequest(updatePropertyStatusValidationSchema), PropertyController.updatePropertyStatus);
router.patch('/:id/accept-reject', auth('admin'), validateRequest(acceptRejectPropertyValidationSchema), PropertyController.acceptOrRejectProperty);
// router.patch('/:id/reject', auth('admin'), validateRequest(acceptRejectPropertyValidationSchema), PropertyController.rejectProperty);
router.delete('/:id', auth('landlord', 'admin'), PropertyController.deleteProperty);
router.patch('/:id/home-page-view', auth('admin'), PropertyController.updateHomePageView);

export const PropertyRoutes = router;