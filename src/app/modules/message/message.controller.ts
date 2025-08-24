import { Request, Response } from 'express';
import httpStatus from 'http-status';
import AppError from '../../error/appError';
import catchAsync from '../../utils/catchAsync';
import { sendResponse } from '../../utils/sendResponse';
import { MessageService } from './message.service';
import { messageValidationSchema } from './message.validation';

const createMessage = catchAsync(async (req: Request, res: Response) => {
    const validatedData = (await messageValidationSchema.parseAsync({ body: req.body })).body;
    const senderId = req.user.userId;

    const message = await MessageService.createMessage(senderId, validatedData);

    sendResponse(res, {
        status: 201,
        success: true,
        message: 'Message sent successfully',
        data: message,
    });
});

const getMessages = catchAsync(async (req: Request, res: Response) => {
    const userId = req.user.userId;
    const { otherUserId, propertyId } = req.query;

    if (!otherUserId || !propertyId) {
        throw new AppError(httpStatus.BAD_REQUEST, 'otherUserId and propertyId are required');
    }

    const messages = await MessageService.getMessages(
        userId,
        otherUserId as string,
        propertyId as string
    );

    sendResponse(res, {
        status: 200,
        success: true,
        message: 'Messages retrieved successfully',
        data: { messages },
    });
});

const getConversations = catchAsync(async (req: Request, res: Response) => {
    const userId = req.user.userId;

    const conversations = await MessageService.getConversations(userId);

    sendResponse(res, {
        status: 200,
        success: true,
        message: 'Conversations retrieved successfully',
        data: { conversations },
    });
});

const getAdminMessages = catchAsync(async (req: Request, res: Response) => {
    const { userId1, userId2, propertyId } = req.query;

    if (!userId1 || !userId2 || !propertyId) {
        throw new AppError(httpStatus.BAD_REQUEST, 'userId1, userId2, and propertyId are required');
    }

    const messages = await MessageService.getAdminMessages(
        userId1 as string,
        userId2 as string,
        propertyId as string
    );

    sendResponse(res, {
        status: 200,
        success: true,
        message: 'Admin messages retrieved successfully',
        data: { messages },
    });
});

const getMessagingTenants = catchAsync(async (req: Request, res: Response) => {
    const landlordId = req.user.userId;

    const tenants = await MessageService.getMessagingTenants(landlordId);

    sendResponse(res, {
        status: 200,
        success: true,
        message: 'Messaging tenants retrieved successfully',
        data: { tenants },
    });
});

export const MessageController = {
    createMessage,
    getMessages,
    getConversations,
    getAdminMessages,
    getMessagingTenants
};