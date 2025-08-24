import { Router } from 'express';
import { PackageController } from './package.controller';
import validateRequest from '../../middleware/validateRequest';
import { packageValidationSchema, updatePackageValidationSchema, updatePackageStatusValidationSchema } from './package.validation';
import auth from '../../middleware/auth';

const router = Router();

router.post('/', auth('admin'), validateRequest(packageValidationSchema), PackageController.createPackage);
router.get('/',auth('admin'), PackageController.getPackages);
router.get('/active', PackageController.getActivePackages);
router.get('/:id', PackageController.getSinglePackage);
router.patch('/:id', auth('admin'), validateRequest(updatePackageValidationSchema), PackageController.updatePackage);
router.patch('/:id/status', auth('admin'), validateRequest(updatePackageStatusValidationSchema), PackageController.updatePackageStatus);
router.delete('/:id', auth('admin'), PackageController.deletePackage);

export const PackageRoutes = router;