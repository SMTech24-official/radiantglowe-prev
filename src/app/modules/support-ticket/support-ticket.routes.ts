
import { Router } from 'express';
import { SupportTicketController } from './support-ticket.controller';
import validateRequest from '../../middleware/validateRequest';
import { supportTicketValidationSchema, supportTicketStatusValidationSchema, messageValidationSchema } from './support-ticket.validation';
import auth from '../../middleware/auth';
import isVerified from '../../middleware/isVerified';

const router = Router();

router.post(
  '/',
  auth('tenant', 'landlord'),
  isVerified,
  validateRequest(supportTicketValidationSchema),
  SupportTicketController.createSupportTicket
);

router.post(
  '/:id/message',
  auth('tenant', 'landlord', 'admin'),
  isVerified,
  validateRequest(messageValidationSchema),
  SupportTicketController.addMessageToTicket
);

router.get(
  '/my-tickets',
  auth('tenant', 'landlord'),
  isVerified,
  SupportTicketController.getUserSupportTickets
);

router.get(
  '/',
  auth('admin'),
  isVerified,
  SupportTicketController.getAllSupportTickets
);

router.patch(
  '/:id/status',
  auth('admin'),
  isVerified,
  validateRequest(supportTicketStatusValidationSchema),
  SupportTicketController.updateSupportTicketStatus
);

export const SupportTicketRoutes = router;