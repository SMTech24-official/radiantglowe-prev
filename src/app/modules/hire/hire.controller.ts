import { Request, Response } from 'express';
import catchAsync from '../../utils/catchAsync';
import { sendResponse } from '../../utils/sendResponse';
import { hireValidationSchema, hireStatusValidationSchema } from './hire.validation';
import { HireService } from './hire.services';
import httpStatus from 'http-status';

const createHireRequest = catchAsync(async (req: Request, res: Response) => {
  const validatedData = (await hireValidationSchema.parseAsync({ body: req.body })).body;
  const userId = req.user?.userId;

  const hireRequest = await HireService.createHireRequest(userId, validatedData);

  sendResponse(res, {
    status: 201,
    success: true,
    message: 'Hire request created successfully',
    data: hireRequest,
  });
});

const getAllHireRequests = catchAsync(async (req: Request, res: Response) => {
  const { page = '1', limit = '10', status, email } = req.query;
  const pageNum = parseInt(page as string, 10);
  const limitNum = parseInt(limit as string, 10);
  const filters = { 
    status: status as 'open' | 'resolved',
    email: email as string,
  };

  const { hireRequests, total } = await HireService.getAllHireRequests(filters, pageNum, limitNum);

  sendResponse(res, {
    status: 200,
    success: true,
    message: 'Hire requests retrieved successfully',
    data: { hireRequests, total, page: pageNum, limit: limitNum },
  });
});

const updateHireRequestStatus = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const { status } = (await hireStatusValidationSchema.parseAsync({ body: req.body })).body;

  const updatedRequest = await HireService.updateHireRequestStatus(id, status);

  sendResponse(res, {
    status: 200,
    success: true,
    message: 'Hire request status updated successfully',
    data: updatedRequest,
  });
});

export const HireController = {
  createHireRequest,
  getAllHireRequests,
  updateHireRequestStatus,
};