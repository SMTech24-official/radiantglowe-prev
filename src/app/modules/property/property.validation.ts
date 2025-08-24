import { z } from 'zod';
import { PropertyTypes } from '../propertyElements/propertyElement.model';
import { furnishedTypes } from './property.model';

// const furnishedTypes = ['fully_furnished', 'semi_furnished', 'unfurnished'];

const propertySchema = z.object({
  landlordId: z.string().optional(),
  headlineYourProperty: z.string().trim().optional(),
  propertyType: z.string().refine(async (val) => {
    const propertyTypesDoc = await PropertyTypes.findOne();
    return propertyTypesDoc?.propertyTypes.some(pt => pt.title === val) || false;
  }, { message: 'Invalid property type' }),
  bedrooms: z.number().min(0),
  bathrooms: z.number().min(0),
  livingRooms: z.number().min(0),
  kitchen: z.number().min(0),
  location: z.object({
    flatOrHouseNo: z.string().optional(),
    address: z.string(),
    state: z.string(),
    city: z.string(),
    town: z.string(),
    area: z.string().optional(),
  }),
  description: z.string().trim().optional(),
  images: z.array(z.string()).min(1),
  status: z.enum(['available', 'rented', 'pending','booking']).default('available'),
  gender: z.string().optional(),
  features: z.array(z.string()).optional(),
  formAvailable: z.string(),
  furnished: z.enum(furnishedTypes).optional(),
  ages: z.string().optional(),
  rentPerYear: z.number().min(0),
  rentPerMonth: z.number().optional(),
  rentPerDay: z.number().optional(),
  serviceCharge: z.number().optional(),
  depositAmount: z.number().optional(),
  isIncludeAllUtilityWithService: z.boolean().default(false),
  minimumLengthOfContract: z.number().min(0).optional(),
  isReferenceRequired: z.boolean().default(false),
  accessYourProperty: z.array(z.string()).optional(),
  mediaLink: z.string().optional(),
  isAcceptTermsAndCondition: z.boolean().default(false),
  isRemoteVideoView: z.boolean().default(false),
  isHomePageView: z.boolean().default(false),
  isActive: z.boolean().default(false),
});

const updatePropertySchema = propertySchema.partial();
const updatePropertyStatusSchema = z.object({
  status: z.enum(['available', 'rented', 'pending','booking']),
});

export const acceptRejectPropertyValidationSchema = z.object({
  body: z.object({
    isActive: z.boolean(),
  }),
});

const acceptRejectPropertySchema = z.object({
  isActive: z.boolean(),
});

export const propertyValidationSchema = z.object({
  body: propertySchema,
});

export const updatePropertyValidationSchema = z.object({
  body: updatePropertySchema,
});

export const updatePropertyStatusValidationSchema = z.object({
  body: updatePropertyStatusSchema,
});
