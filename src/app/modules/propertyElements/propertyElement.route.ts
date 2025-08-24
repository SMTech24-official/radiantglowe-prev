import express from 'express';
import auth from '../../middleware/auth';
import validateRequest from '../../middleware/validateRequest';
import { propertyTypesValidationSchema, updatePropertyTypesValidationSchema } from './propertyElement.validation';
import { PropertyTypesController } from './propertyElement.controller';

const router = express.Router();

router.post('/', auth('admin'), validateRequest(propertyTypesValidationSchema), PropertyTypesController.createPropertyTypes);
router.get('/', PropertyTypesController.getPropertyTypes);
router.patch('/', auth('admin'), validateRequest(updatePropertyTypesValidationSchema), PropertyTypesController.updatePropertyTypes);
router.delete('/:type/:value', auth('admin'), PropertyTypesController.deletePropertyType);

export const PropertyTypesRoutes = router;