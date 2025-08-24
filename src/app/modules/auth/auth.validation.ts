import { z } from 'zod';

 export const loginValidationSchema = z.object({
  body: z.object({
    email: z.string({ required_error: 'email is required.' }),
    password: z.string({ required_error: 'Password is required' }),
  }),
});

const forgotPasswordSchema = z.object({
  body: z.object({
    email: z.string().email({ message: "Invalid email address" }),
  }),
});

const resetPasswordSchema = z.object({
  body: z.object({
    password: z.string().min(6, { message: "New password must be at least 6 characters" }),
  }),
});

const changePasswordBodySchema = z
  .object({
    oldPassword: z.string().min(6, { message: "Old password must be at least 6 characters" }),
    newPassword: z.string().min(6, { message: "New password must be at least 6 characters" }),
  })
  .refine((data) => data.oldPassword !== data.newPassword, {
    path: ["newPassword"],
    message: "New password must be different from old password",
  });

export const changePasswordSchema = z.object({
  body: changePasswordBodySchema,
});

export const AuthValidation = {
  loginValidationSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
  changePasswordSchema,
};