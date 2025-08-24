import { z } from 'zod';

const propertyTypeSchema = z.object({
  icon: z.string({ required_error: 'Icon is required' }),
  title: z.string({ required_error: 'Title is required' }),
  newTitle: z.string().optional(),
});

export const propertyTypesValidationSchema = z.object({
  body: z.object({
    propertyTypes: z.array(propertyTypeSchema).optional(),
    accessTypes: z.array(z.string()).optional(),
    featureTypes: z.array(z.string()).optional(),
  }).refine(
    (data) => data.propertyTypes?.length || data.accessTypes?.length || data.featureTypes?.length,
    { message: 'At least one type array must be provided' }
  ),
});

export const updatePropertyTypesValidationSchema = z.object({
  body: z.object({
    propertyTypes: z.array(propertyTypeSchema).optional(),
    accessTypes: z.array(z.string()).optional(),
    featureTypes: z.array(z.string()).optional(),
  }).refine(
    (data) => data.propertyTypes?.length || data.accessTypes?.length || data.featureTypes?.length,
    { message: 'At least one type array must be provided for update' }
  ),
});