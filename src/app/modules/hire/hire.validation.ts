import { z } from 'zod';

export const hireValidationSchema = z.object({
  body: z.object({
    name: z.string().trim().min(1, 'Name is required'),
    email: z.string().email('Invalid email address').trim(),
    phoneNumber: z.string().trim().min(1, 'Phone number is required'),
    address: z.object({
      flatOrHouseNo: z.string().trim().optional(),
      address: z.string().trim().min(1, 'Address is required'),
      state: z.string().trim().min(1, 'State is required'),
      city: z.string().trim().min(1, 'City is required'),
      town: z.string().trim().optional(),
      area: z.string().trim().optional(),
    }),
    briefMessage: z.string().trim().min(1, 'Brief message is required'),
  }),
});

export const hireStatusValidationSchema = z.object({
  body: z.object({
    status: z.enum(['open', 'in_progress', 'resolved', 'closed'], { message: 'Invalid status' }),
  }),
});