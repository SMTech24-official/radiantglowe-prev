
import { Request, Response } from 'express';
import catchAsync from '../../utils/catchAsync';
import { sendResponse } from '../../utils/sendResponse';
import { supportTicketValidationSchema, supportTicketStatusValidationSchema, messageValidationSchema } from './support-ticket.validation';
import { SupportTicketService } from './support-ticket.services';
import httpStatus from 'http-status';

const createSupportTicket = catchAsync(async (req: Request, res: Response) => {
  const validatedData = (await supportTicketValidationSchema.parseAsync({ body: req.body })).body;
  const userId = req.user.userId;

  const supportTicket = await SupportTicketService.createSupportTicket(userId, validatedData as any);

  sendResponse(res, {
    status: 201,
    success: true,
    message: 'Support ticket created successfully',
    data: supportTicket,
  });
});

const addMessageToTicket = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const validatedData = (await messageValidationSchema.parseAsync({ body: req.body })).body;
  const userId = req.user.userId;
  const role = req.user.role; // 'tenant', 'landlord', or 'admin'

  const updatedTicket = await SupportTicketService.addMessageToTicket(id, userId, role, validatedData.content);

  sendResponse(res, {
    status: 200,
    success: true,
    message: 'Message added to support ticket successfully',
    data: updatedTicket,
  });
});

const getUserSupportTickets = catchAsync(async (req: Request, res: Response) => {
  const userId = req.user.userId;
  const { page = '1', limit = '10' } = req.query;
  const pageNum = parseInt(page as string, 10);
  const limitNum = parseInt(limit as string, 10);

  const { tickets, total } = await SupportTicketService.getUserSupportTickets(userId, pageNum, limitNum);

  sendResponse(res, {
    status: 200,
    success: true,
    message: 'Support tickets retrieved successfully',
    data: { tickets, total, page: pageNum, limit: limitNum },
  });
});

const getAllSupportTickets = catchAsync(async (req: Request, res: Response) => {
  const { userId, category, status, priority, ticketNumber, page = '1', limit = '10' } = req.query;
  const filters = {
    userId: userId as string,
    category: category as 'technical' | 'account' | 'billing' | 'feature_request' | 'other',
    status: status as 'open' | 'in_progress' | 'resolved' | 'closed',
    priority: priority as 'low' | 'medium' | 'high' | 'urgent',
    ticketNumber: ticketNumber as string,
  };
  const pageNum = parseInt(page as string, 10);
  const limitNum = parseInt(limit as string, 10);

  const { tickets, total } = await SupportTicketService.getAllSupportTickets(filters, pageNum, limitNum);

  sendResponse(res, {
    status: 200,
    success: true,
    message: 'All support tickets retrieved successfully',
    data: { tickets, total, page: pageNum, limit: limitNum },
  });
});

const updateSupportTicketStatus = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const { status } = (await supportTicketStatusValidationSchema.parseAsync({ body: req.body })).body;

  const updatedTicket = await SupportTicketService.updateSupportTicketStatus(id, status);

  sendResponse(res, {
    status: 200,
    success: true,
    message: 'Support ticket status updated successfully',
    data: updatedTicket,
  });
});

export const SupportTicketController = {
  createSupportTicket,
  addMessageToTicket,
  getUserSupportTickets,
  getAllSupportTickets,
  updateSupportTicketStatus,
};