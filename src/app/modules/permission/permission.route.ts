import { Router } from 'express';
import { PermissionController } from './permission.controller';
import validateRequest from '../../middleware/validateRequest';
import { permissionValidationSchema, updatePermissionStatusValidationSchema } from './permission.validation';
import auth from '../../middleware/auth';
import isVerified from '../../middleware/isVerified';

const router = Router();

router.post('/', auth('tenant', 'admin'), validateRequest(permissionValidationSchema), PermissionController.createPermission);
router.get('/', auth('admin', 'landlord', 'tenant'), PermissionController.getPermissions);
router.get('/my-requests', auth('landlord'), isVerified, PermissionController.getLandlordPermissionRequests);
router.get('/tenant-permision', auth('tenant'), isVerified, PermissionController.gettenantPermission);
router.get('/:id', auth('admin', 'landlord', 'tenant'), PermissionController.getSinglePermission);
router.patch('/:id/status', auth('landlord'), isVerified, validateRequest(updatePermissionStatusValidationSchema), PermissionController.updatePermissionStatus);
router.delete('/:id', auth('landlord', 'admin'), PermissionController.deletePermission);

export const PermissionRoutes = router;