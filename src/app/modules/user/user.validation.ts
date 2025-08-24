// src/app/modules/user/user.validation.ts
import { z } from 'zod';



export const userValidationSchema = z.object({
  body: z.object({
    // uid: z.string({ required_error: 'UID is required' }),
    name: z.string({ required_error: 'Name is required' }),
    phoneNumber: z.string({ required_error: 'Phone number is required' }),
    email: z.string({ required_error: 'Email is required' }).email('Invalid email address'),
    password: z.string({ required_error: 'Password is required' }).min(6, 'Password must be at least 6 characters'),
    confirmPassword: z.string({ required_error: 'Confirm Password is required' }),
    image: z.string().optional(),
  }).refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ['confirmPassword'],
  }),
});


export const userUpdateValidationSchema = z.object({
  image: z.string({ required_error: 'Image is required' }).optional(),
  name: z.string({ required_error: 'Name is required' }).optional(),
  phoneNumber: z.string({ required_error: 'Phone number is required' }).optional(),
  address: z
    .object({
      flatOrHouseNo: z.string().optional(),
      address: z.string().optional(),
      state: z.string().optional(),
      city: z.string().optional(),
      town: z.string().optional(),
      area: z.string().optional(),
    })
    .optional(),
  profileVerificationImage: z.array(z.string()).optional(),
  lookingPropertyForTenant: z.array(z.string()).optional(),
  websiteUrl: z.string().url('Invalid URL').optional(),
  guarantor: z
    .object({
      name: z.string().optional(),
      telephone: z.string().optional(),
      email: z.string().email('Invalid email address').optional(),
      profession: z.string().optional(),
      address: z
        .object({
          flatOrHouseNo: z.string().optional(),
          address: z.string().optional(),
          state: z.string().optional(),
          city: z.string().optional(),
          town: z.string().optional(),
          area: z.string().optional(),
        })
        .optional(),
    })
    .optional(),
  references: z
    .array(
      z.object({
        name: z.string().optional(),
        telephone: z.string().optional(),
        email: z.string().email('Invalid email address').optional(),
        profession: z.string().optional(),
        address: z
          .object({
            flatOrHouseNo: z.string().optional(),
            address: z.string().optional(),
            state: z.string().optional(),
            city: z.string().optional(),
            town: z.string().optional(),
            area: z.string().optional(),
          })
          .optional(),
      })
    )
    .optional(),
});


