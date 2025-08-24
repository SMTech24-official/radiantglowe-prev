import express from 'express';
import auth from '../../middleware/auth';
import validateRequest from '../../middleware/validateRequest';
import { AuthController } from './auth.controller';
import { AuthValidation } from './auth.validation';
const router = express.Router();



router.post("/login", validateRequest(AuthValidation.loginValidationSchema), AuthController.loginUser);
router.post("/forgot-password", validateRequest(AuthValidation.forgotPasswordSchema), AuthController.forgotPassword);
router.post("/reset-password", AuthController.resetPassword);
router.post("/change-password", auth("admin","landlord","tenant"), validateRequest(AuthValidation.changePasswordSchema), AuthController.changePassword);
router.post("/social-login",AuthController.socialLogin)
router.post("/logout", AuthController.logoutUser)

export const AuthRoutes = router;