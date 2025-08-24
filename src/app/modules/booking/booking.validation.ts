import { z } from 'zod';

const transactionSchema = z.object({
  message: z.string().optional(),
  redirecturl: z.string().optional(),
  reference: z.string(),
  status: z.string(),
  trans: z.string().optional(),
  transaction: z.string(),
  trxref: z.string().optional(),
});

const bookingSchema = z.object({
  tenantId: z.string().optional(),
  landlordId: z.string(),
  propertyId: z.string(),
  permissionId: z.string(),
  paymentMethod: z.enum(['online', 'offline']),
  transaction: transactionSchema.optional(), // Required for online payments
  amount: z.number().positive(),
});

export const bookingValidationSchema = z.object({
  body: bookingSchema,
});