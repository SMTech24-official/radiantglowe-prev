import { z } from 'zod';
import { Types } from 'mongoose';

const subscriptionSchema = z.object({
  package: z.string({ required_error: 'Package ID is required' }).refine(
    (val) => Types.ObjectId.isValid(val),
    { message: 'Invalid Package ID' }
  ),
  price: z.number({ required_error: 'Price is required for PAID packages' }).min(0).optional(),
  paymentMethodId: z.string({ required_error: 'Payment method ID is required for PAID packages' }).optional(),
});

const updateSubscriptionSchema = z.object({
  package: z.string().refine(
    (val) => Types.ObjectId.isValid(val),
    { message: 'Invalid Package ID' }
  ).optional(),
  status: z.enum(['pending', 'active', 'failed', 'canceled', 'refunded']).optional(),
});

export const subscriptionValidationSchema = z.object({
  body: subscriptionSchema,
});

export const updateSubscriptionValidationSchema = z.object({
  body: updateSubscriptionSchema,
});