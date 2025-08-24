// src/app/modules/user/user.route.ts
import express from 'express';


import auth from '../../middleware/auth';
import validateRequest from '../../middleware/validateRequest';
import { UserController } from './user.controller';
import { userUpdateValidationSchema, userValidationSchema } from './user.validation';
import isVerified from '../../middleware/isVerified';

const router = express.Router();

router.post('/register', validateRequest(userValidationSchema), UserController.registerUser);
router.get('/me', auth('landlord',"admin","tenant"), UserController.getMe);
router.get('/',auth('admin'), UserController.getAllUser);
router.patch('/', auth('landlord',"admin","tenant"), validateRequest(userUpdateValidationSchema), UserController.updateUser);
router.patch('/:id', auth("admin"), validateRequest(userUpdateValidationSchema), UserController.updateUser);
router.patch('/verify/:id', auth("admin"),  UserController.verifyUser);
router.delete('/:id', auth('admin'), UserController.deleteUser);
router.get('/:id', auth('admin','landlord'), UserController.getSingleUser);


export const userRoutes = router;
