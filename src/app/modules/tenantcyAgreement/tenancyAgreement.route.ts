// tenancyAgreement.route.ts
import { Router } from 'express';
import { TenancyAgreementController } from './tenancyAgreement.controller';
import validateRequest from '../../middleware/validateRequest';
import { initiateTenancyAgreementValidationSchema, reviewTenancyAgreementValidationSchema, signTenancyAgreementValidationSchema, updateTenancyAgreementValidationSchema } from './tenancyAgreement.validation';
import auth from '../../middleware/auth';

const router = Router();

router.post('/', auth('landlord', 'tenant'), validateRequest(initiateTenancyAgreementValidationSchema), TenancyAgreementController.initiateTenancyAgreement);
router.get('/', auth('admin'), TenancyAgreementController.getTenancyAgreements);
router.get('/my-agreements', auth('landlord', 'tenant'), TenancyAgreementController.getMyTenancyAgreements);
router.get('/:id', auth('admin', 'landlord', 'tenant'), TenancyAgreementController.getSingleTenancyAgreement);
router.patch('/:id', auth('admin'), validateRequest(updateTenancyAgreementValidationSchema), TenancyAgreementController.updateTenancyAgreement);
router.patch('/:id/review', auth('landlord', 'tenant'), validateRequest(reviewTenancyAgreementValidationSchema), TenancyAgreementController.reviewTenancyAgreement);
router.patch('/:id/sign', auth('landlord', 'tenant'), validateRequest(signTenancyAgreementValidationSchema), TenancyAgreementController.signTenancyAgreement);
router.delete('/:id', auth('landlord', 'admin'), TenancyAgreementController.deleteTenancyAgreement);

export const TenancyAgreementRoutes = router;