import { z } from 'zod';
import { Types } from 'mongoose';

const reviewSchema = z.object({
  property: z.string().refine(val => Types.ObjectId.isValid(val), { message: 'Invalid property ID' }),
  rating: z.number().min(1).max(5),
  reviewText: z.string().trim().optional(),
  name: z.string().trim().optional(),
});

const likeDislikeSchema = z.object({
  userId: z.string().refine(val => Types.ObjectId.isValid(val), { message: 'Invalid user ID' }),
});

const homePageViewSchema = z.object({
  body: z.object({
    isHomePageView: z.boolean(),
  }),
});

const editReviewSchema = z.object({
  body: z.object({
    rating: z.number().min(1).max(5).optional(),
    reviewText: z.string().trim().optional(),
    name: z.string().trim().optional(),
  }),
});

export const reviewPropertyValidationSchema = z.object({
  body: reviewSchema,
});

export const likeReviewValidationSchema = z.object({
  body: likeDislikeSchema,
});

export const dislikeReviewValidationSchema = z.object({
  body: likeDislikeSchema,
});

export const homePageViewValidationSchema = z.object({
  body: homePageViewSchema,
});

export const editReviewValidationSchema = z.object({
  body: editReviewSchema,
});