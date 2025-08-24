import { Router } from 'express';
import auth from '../../middleware/auth';
import isVerified from '../../middleware/isVerified';
import validateRequest from '../../middleware/validateRequest';
import { MessageController } from './message.controller';
import { messageValidationSchema } from './message.validation';

const router = Router();

router.post(
    '/',
    auth('tenant', 'landlord'),
    isVerified,
    validateRequest(messageValidationSchema),
    MessageController.createMessage
);

router.get(
    '/',
    auth('tenant', 'landlord'),
    isVerified,
    MessageController.getMessages
);

router.get(
    '/conversations',
    auth('tenant', 'landlord'),
    isVerified,
    MessageController.getConversations
);

router.get(
    '/admin/messages',
    auth('admin'),
    isVerified,
    MessageController.getAdminMessages
);

router.get(
  '/tenants',
  auth('landlord'),
  isVerified,
  MessageController.getMessagingTenants
);

export const MessageRoutes = router;