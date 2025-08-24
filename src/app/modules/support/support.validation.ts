import { z } from 'zod';

export const supportValidationSchema = z.object({
  body: z.object({
    email: z.string().email('Invalid email address').trim(),
    message: z.string().min(1, 'Message is required').trim(),
    name: z.string().trim().optional(),
    phoneNumber: z.string().trim().optional(),
    messageType: z.enum(['technical', 'billing', 'general', 'suggestion', 'other', 'account', 'feature_request'], { message: 'Invalid message type' }).optional(),
  }),
});

export const supportStatusValidationSchema = z.object({
  body: z.object({
    status: z.enum(['open', 'resolved'], { message: 'Invalid status' }),
  }),
});