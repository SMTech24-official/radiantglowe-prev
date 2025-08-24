import { z } from 'zod';

const packageSchema = z.object({
  name: z.string({ required_error: 'Name is required' }).trim(),
  description: z.string().optional(),
  price: z.number({ required_error: 'Price is required' }).min(0, 'Price must be non-negative'),
  duration: z.enum(['FREE', 'MONTHLY', 'YEARLY'], { required_error: 'Duration is required' }),
   durationInDays: z.union([
    z.number({ required_error: 'Duration in days is required' }).min(0, 'Duration in days must be non-negative'),
    z.literal('UNLIMITED')
  ]),
  state: z.enum(['PAID', 'FREE'], { required_error: 'State is required' }),
  features: z.array(z.string()).default([]),
  bgColor: z.string().default('#ffffff').optional(),
  isActive: z.boolean().default(false).optional(),
  textColor: z.string().default('#000000').optional(),
  isFreePromo: z.boolean().default(false).optional(),
  freePromoText: z.string().default('FREE promo for limited period.').optional(),
  propertyLimit: z.number().min(0, 'Property limit must be non-negative'),
});

export const packageValidationSchema = z.object({
  body: packageSchema,
});

export const updatePackageValidationSchema = z.object({
  body: packageSchema.partial(),
});

export const updatePackageStatusValidationSchema = z.object({
  body: z.object({
    isActive: z.boolean({ required_error: 'isActive is required' }),
  }),
});