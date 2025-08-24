import { z } from 'zod';

const permissionSchema = z.object({
  tenantId: z.string(),
  landlordId: z.string(),
  propertyId: z.string(),
  status: z.enum(['pending', 'granted', 'denied']).default('pending').optional(),
  requestDate: z.date().default(() => new Date()).optional(),
  responseDate: z.date().optional(),
  isActive: z.boolean().default(true).optional(),
});

const updatePermissionStatusSchema = z.object({
  status: z.enum(['granted', 'denied']),
});

export const permissionValidationSchema = z.object({
  body: permissionSchema,
});

export const updatePermissionStatusValidationSchema = z.object({
  body: updatePermissionStatusSchema,
});