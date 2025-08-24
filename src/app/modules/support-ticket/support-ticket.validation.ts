
import { z } from 'zod';

export const supportTicketValidationSchema = z.object({
  body: z.object({
    title: z.string().min(1, 'Title is required').trim(),
    description: z.string().min(1, 'Description is required').trim(),
    category: z.enum(['technical', 'billing', 'general', 'suggestion', 'other', 'account', 'feature_request'], { message: 'Invalid category' }),
    priority: z.enum(['low', 'medium', 'high', 'urgent'], { message: 'Invalid priority' }).optional(),
  }),
});

export const supportTicketStatusValidationSchema = z.object({
  body: z.object({
    status: z.enum(['open', 'in_progress', 'resolved', 'closed'], { message: 'Invalid status' }),
  }),
});

export const messageValidationSchema = z.object({
  body: z.object({
    content: z.string().min(1, 'Message content is required').trim(),
  }),
});
