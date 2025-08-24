import { Request, Response } from 'express';
import catchAsync from '../../utils/catchAsync';
import { sendResponse } from '../../utils/sendResponse';
import { PropertyReviewService } from './propertyReview.service';
import { reviewPropertyValidationSchema, likeReviewValidationSchema, dislikeReviewValidationSchema, homePageViewValidationSchema, editReviewValidationSchema } from './propertyReview.validation';

const createReview = catchAsync(async (req: Request, res: Response) => {
  const validatedData = (await reviewPropertyValidationSchema.parseAsync({ body: req.body })).body
  const userId = req?.user?.userId || '';

  const review = await PropertyReviewService.createReview(userId, {
    ...validatedData,
    user: userId,
    likes: [],
    dislikes: [],
    isHomePageView: false,
  });
  sendResponse(res, {
    status: 201,
    success: true,
    message: 'Review created successfully',
    data: review,
  });
});

const likeReview = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const userId = req?.user?.userId;
  const review = await PropertyReviewService.likeReview(id, userId);
  sendResponse(res, {
    status: 200,
    success: true,
    message: 'Review liked successfully',
    data: review,
  });
});

const dislikeReview = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const userId = req.user.userId;
  const review = await PropertyReviewService.dislikeReview(id, userId);
  sendResponse(res, {
    status: 200,
    success: true,
    message: 'Review disliked successfully',
    data: review,
  });
});

const getPropertyRating = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const ratingData = await PropertyReviewService.getPropertyRating(id);
  sendResponse(res, {
    status: 200,
    success: true,
    message: 'Property rating retrieved successfully',
    data: ratingData,
  });
});

const getReviewsByProperty = catchAsync(async (req: Request, res: Response) => {
  const { propertyId } = req.params;
  const reviews = await PropertyReviewService.getReviewsByProperty(propertyId);
  sendResponse(res, {
    status: 200,
    success: true,
    message: 'Property reviews retrieved successfully',
    data: reviews,
  });
});

const getAllReviews = catchAsync(async (req: Request, res: Response) => {
  const reviews = await PropertyReviewService.getAllReviews();
  sendResponse(res, {
    status: 200,
    success: true,
    message: 'Reviews retrieved successfully',
    data: reviews,
  });
});

const updateHomePageViewStatus = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  // console.log(req.body,' isHomePageView');
  // const { isHomePageView } = req.body;
  const isHomePageView = true
  const review = await PropertyReviewService.updateHomePageViewStatus(id, isHomePageView);
  sendResponse(res, {
    status: 200,
    success: true,
    message: 'Review homepage view status updated successfully',
    data: review,
  });
});

const editReview = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  // const validatedData = (await editReviewValidationSchema.parseAsync({ body: req.body })).body;

  // console.log(validatedData,req.body, 'validatedData in editReview');
  const review = await PropertyReviewService.editReview(id, req.body as any);
  sendResponse(res, {
    status: 200,
    success: true,
    message: 'Review updated successfully',
    data: review,
  });
});

const getHomePageReviews = catchAsync(async (req: Request, res: Response) => {
  const reviews = await PropertyReviewService.getHomePageReviews();
  sendResponse(res, {
    status: 200,
    success: true,
    message: 'Homepage reviews retrieved successfully',
    data: reviews,
  });
});

export const PropertyReviewController = {
  createReview,
  likeReview,
  dislikeReview,
  getPropertyRating,
  getReviewsByProperty,
  getAllReviews,
  updateHomePageViewStatus,
  editReview,
  getHomePageReviews,
};