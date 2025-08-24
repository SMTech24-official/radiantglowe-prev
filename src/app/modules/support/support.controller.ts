import { Request, Response } from 'express';
import catchAsync from '../../utils/catchAsync';
import { sendResponse } from '../../utils/sendResponse';
import { supportValidationSchema, supportStatusValidationSchema } from './support.validation';
import { SupportService } from './support.services';
import httpStatus from 'http-status';

const createSupportMessage = catchAsync(async (req: Request, res: Response) => {
  const validatedData = (await supportValidationSchema.parseAsync({ body: req.body })).body;
  const userId = req.user?.userId; // userId is optional (undefined for unauthenticated users)

  const supportMessage = await SupportService.createSupportMessage(userId, validatedData as any);

  sendResponse(res, {
    status: 201,
    success: true,
    message: 'Support message created successfully',
    data: supportMessage,
  });
});

const getUserSupportMessages = catchAsync(async (req: Request, res: Response) => {
  const userId = req.user.userId;
  const { page = '1', limit = '10' } = req.query;
  const pageNum = parseInt(page as string, 10);
  const limitNum = parseInt(limit as string, 10);

  const { messages, total } = await SupportService.getUserSupportMessages(userId, pageNum, limitNum);

  sendResponse(res, {
    status: 200,
    success: true,
    message: 'Support messages retrieved successfully',
    data: { messages, total, page: pageNum, limit: limitNum },
  });
});

const getAllSupportMessages = catchAsync(async (req: Request, res: Response) => {
  const { userId, email, status, page = '1', limit = '10' } = req.query;
  const filters = {
    userId: userId as string,
    email: email as string,
    status: status as 'open' | 'resolved',
  };
  const pageNum = parseInt(page as string, 10);
  const limitNum = parseInt(limit as string, 10);

  const { messages, total } = await SupportService.getAllSupportMessages(filters, pageNum, limitNum);

  sendResponse(res, {
    status: 200,
    success: true,
    message: 'All support messages retrieved successfully',
    data: { messages, total, page: pageNum, limit: limitNum },
  });
});

const updateSupportMessageStatus = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const { status } = (await supportStatusValidationSchema.parseAsync({ body: req.body })).body;

  const updatedMessage = await SupportService.updateSupportMessageStatus(id, status);

  sendResponse(res, {
    status: 200,
    success: true,
    message: 'Support message status updated successfully',
    data: updatedMessage,
  });
});

export const SupportController = {
  createSupportMessage,
  getUserSupportMessages,
  getAllSupportMessages,
  updateSupportMessageStatus,
};