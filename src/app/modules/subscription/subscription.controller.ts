import { Request, Response } from 'express';
import catchAsync from '../../utils/catchAsync';
import { sendResponse } from '../../utils/sendResponse';
import { SubscriptionService } from './subscription.service';
import { subscriptionValidationSchema, updateSubscriptionValidationSchema } from './subscription.validation';
import { Types } from 'mongoose';

const createSubscription = catchAsync(async (req: Request, res: Response) => {
  const validatedData = subscriptionValidationSchema.parse({ body: req.body }).body;
  const landlordId = req.user.userId;
  const subscription = await SubscriptionService.createSubscription(landlordId, validatedData);
  sendResponse(res, {
    status: 201,
    success: true,
    message: 'Subscription created successfully',
    data: subscription,
  });
});

const getSubscriptions = catchAsync(async (req: Request, res: Response) => {
  const subscriptions = await SubscriptionService.getSubscriptions();
  sendResponse(res, {
    status: 200,
    success: true,
    message: 'Subscriptions retrieved successfully',
    data: subscriptions,
  });
});
const getLanloardSubscriptions = catchAsync(async (req: Request, res: Response) => {
  const landlordId = req.user.userId;
  const subscriptions = await SubscriptionService.getLandlordSubscriptions(landlordId);
  sendResponse(res, {
    status: 200,
    success: true,
    message: 'Subscriptions retrieved successfully',
    data: subscriptions,
  });
});

const getSingleSubscription = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const userId = req.user.userId;
  const userRole = req.user.role;
  const subscription = await SubscriptionService.getSingleSubscription(id, userId, userRole);
  sendResponse(res, {
    status: 200,
    success: true,
    message: 'Subscription retrieved successfully',
    data: subscription,
  });
});

const updateSubscription = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const validatedData = updateSubscriptionValidationSchema.parse({ body: req.body }).body;
  // Convert package string to ObjectId if provided
  if (validatedData.package) {
    validatedData.package = new Types.ObjectId(validatedData.package) as any;
  }
  const updatedSubscription = await SubscriptionService.updateSubscription(id, validatedData);
  sendResponse(res, {
    status: 200,
    success: true,
    message: 'Subscription updated successfully',
    data: updatedSubscription,
  });
});

const deleteSubscription = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const deletedSubscription = await SubscriptionService.deleteSubscription(id);
  sendResponse(res, {
    status: 200,
    success: true,
    message: 'Subscription deleted successfully',
    data: deletedSubscription,
  });
});

// refund subscription

const refundSubscription = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const { refundReason } = req.body;
  const refundedSubscription = await SubscriptionService.refundSubscription(id, refundReason);
  sendResponse(res, {
    status: 200,
    success: true,
    message: 'Subscription refunded successfully',
    data: refundedSubscription,
  });
});

export const SubscriptionController = {
  createSubscription,
  getSubscriptions,
  getLanloardSubscriptions,
  getSingleSubscription,
  updateSubscription,
  deleteSubscription,
  refundSubscription
};