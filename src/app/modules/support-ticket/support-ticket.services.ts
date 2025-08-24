
import httpStatus from 'http-status';
import AppError from '../../error/appError';
import { emailVariable } from '../../utils/constantValue';
import { sendAdminEmail, sendEmail } from '../../utils/sendEmail';
import { User } from '../user/user.model';
import { ISupportTicket } from './support-ticket.interface';
import { SupportTicket } from './support-ticket.model';

interface IPayload {
  title: string;
  description: string;
  category: string;
  priority?: string;
}

const generateTicketNumber = async (): Promise<string> => {
  const lastTicket = await SupportTicket.findOne()
    .sort({ createdAt: -1 })
    .select('ticketNumber');

  let newTicketNumber: string;
  if (lastTicket && lastTicket.ticketNumber) {
    const lastNumber = parseInt(lastTicket.ticketNumber.replace('TICKET-', ''), 10);
    newTicketNumber = `TICKET-${String(lastNumber + 1).padStart(8, '0')}`;
  } else {
    newTicketNumber = `TICKET-00000001`;
  }

  const existingTicket = await SupportTicket.findOne({ ticketNumber: newTicketNumber });
  if (existingTicket) {
    throw new AppError(httpStatus.CONFLICT, 'Ticket number already exists');
  }
  return newTicketNumber;
};

const createSupportTicket = async (userId: string, payload: IPayload): Promise<ISupportTicket> => {
  const ticketNumber = await generateTicketNumber();
  const supportTicket = await SupportTicket.create({
    userId,
    ticketNumber,
    title: payload.title,
    description: payload.description,
    category: payload.category,
    priority: payload.priority || 'medium',
    status: 'open',
    messages: [{ sender: 'user', content: payload.description }],
  });

  const user = await User.findById(userId).select('email name');

  await sendEmail(
    user?.email || '',
    `Support Ticket Created (#${supportTicket.ticketNumber})`,
    `
    <div style="font-family: Arial, sans-serif; line-height: 1.6; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 8px;">
      ${emailVariable.headerLogo}
      <h2 style="color: #333; text-align: center;">Support Ticket Created</h2>
      <p style="color: #555;">Dear ${user?.name || ''},</p>
      <p>Your support ticket has been successfully created with the following details:</p>
      
      <ul style="color: #555;">
        <li><strong>Ticket Number:</strong> ${supportTicket.ticketNumber}</li>
        <li><strong>Title:</strong> ${supportTicket.title}</li>
        <li><strong>Category:</strong> ${supportTicket.category}</li>
        <li><strong>Description:</strong> ${supportTicket.description}</li>
      </ul>

      <p style="color: #555;">Our support team will review your ticket and get back to you as soon as possible.</p>
      <p style="color: #555;">Best regards,<br>${emailVariable.regards}</p>
      <hr style="border-top: 1px solid #e0e0e0; margin: 20px 0;">
      ${emailVariable.footer}
    </div>
  `
  );

  await sendAdminEmail(
    '',
    `New Support Ticket (#${supportTicket.ticketNumber})`,
    `
    <div style="font-family: Arial, sans-serif; line-height: 1.6; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 8px;">
      ${emailVariable.headerLogo}
      <h2 style="color: #333; text-align: center;">New Support Ticket Submitted</h2>
      <p style="color: #555;">Hello Admin,</p>
      <p>A new support ticket has been submitted by <strong>${user?.name}</strong> (Email: ${user?.email}).</p>

      <ul style="color: #555;">
        <li><strong>Ticket Number:</strong> ${supportTicket.ticketNumber}</li>
        <li><strong>Title:</strong> ${supportTicket.title}</li>
        <li><strong>Category:</strong> ${supportTicket.category}</li>
        <li><strong>Description:</strong> ${supportTicket.description}</li>
      </ul>

      <p style="color: #555;">Please review and respond to the ticket as soon as possible.</p>
      <p style="color: #555;">Regards,<br>${emailVariable.regards}</p>
      <hr style="border-top: 1px solid #e0e0e0; margin: 20px 0;">
      ${emailVariable.footer}
    </div>
  `
  );

  return supportTicket;
};

const addMessageToTicket = async (ticketId: string, userId: string, role: string, content: string): Promise<ISupportTicket | null> => {
  const supportTicket = await SupportTicket.findById(ticketId);
  if (!supportTicket) {
    throw new AppError(httpStatus.NOT_FOUND, 'Support ticket not found');
  }

  const user = await User.findById(userId).select('email role name');

  if (role !== 'admin' && supportTicket.userId.toString() !== userId) {
    throw new AppError(httpStatus.FORBIDDEN, 'You can only reply to your own tickets');
  }

  if (supportTicket.status === 'closed') {
    throw new AppError(httpStatus.BAD_REQUEST, 'Cannot add messages to a closed ticket');
  }

  supportTicket.messages.push({
    sender: role === 'admin' ? 'admin' : 'user',
    content,
    createdAt: new Date(),
  });

  await supportTicket.save();
  if (role === 'admin') {
    await sendEmail(
      user?.email || '',
      `New Response on Your Support Ticket (#${ticketId})`,
      `
      <div style="font-family: Arial, sans-serif; line-height: 1.6; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 8px;">
        ${emailVariable.headerLogo}
        <h2 style="color: #333; text-align: center;">New Response on Your Support Ticket</h2>
        <p style="color: #555;">Dear ${user?.name},</p>
        <p style="color: #555;">You have received a new message from our support team regarding your ticket (#${ticketId}):</p>
        <blockquote style="border-left: 4px solid #007BFF; padding-left: 10px; color: #555;">${content}</blockquote>
        <p style="color: #555;">You can reply to this ticket by logging into your account.</p>
        <p style="color: #555;">Best regards,<br>${emailVariable.regards}</p>
        <hr style="border-top: 1px solid #e0e0e0; margin: 20px 0;">
        ${emailVariable.footer}
      </div>
    `
    );
  }

  if (role !== 'admin') {
    await sendAdminEmail(
      '',
      `New Message on Support Ticket (#${ticketId})`,
      `
      <div style="font-family: Arial, sans-serif; line-height: 1.6; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 8px;">
        ${emailVariable.headerLogo}
        <h2 style="color: #333; text-align: center;">New Message on Support Ticket</h2>
        <p style="color: #555;">Hello Admin,</p>
        <p style="color: #555;">A new message has been added to support ticket (#${ticketId}) by <strong>${user?.name}</strong> (Email: ${user?.email}):</p>
        <blockquote style="border-left: 4px solid #007BFF; padding-left: 10px; color: #555;">${content}</blockquote>
        <p style="color: #555;">Please review and respond to the ticket as soon as possible.</p>
        <p style="color: #555;">Regards,<br>${emailVariable.regards}</p>
        <hr style="border-top: 1px solid #e0e0e0; margin: 20px 0;">
        ${emailVariable.footer}
      </div>
    `
    );
  }



  return SupportTicket.findById(ticketId).populate('userId', 'name email');
};

const getUserSupportTickets = async (userId: string, page: number, limit: number) => {
  const skip = (page - 1) * limit;
  const tickets = await SupportTicket.find({ userId })
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit)
    .populate('userId', 'name email role');
  const total = await SupportTicket.countDocuments({ userId });

  return { tickets, total };
};

const getAllSupportTickets = async (
  filters: {
    userId?: string;
    category?: 'technical' | 'account' | 'billing' | 'feature_request' | 'other';
    status?: 'open' | 'in_progress' | 'resolved' | 'closed';
    priority?: 'low' | 'medium' | 'high' | 'urgent';
    ticketNumber?: string;
  },
  page: number,
  limit: number
) => {
  const query: any = {};
  if (filters.userId) query.userId = filters.userId;
  if (filters.category) query.category = filters.category;
  if (filters.status) query.status = filters.status;
  if (filters.priority) query.priority = filters.priority;
  if (filters.ticketNumber) query.ticketNumber = { $regex: filters.ticketNumber, $options: 'i' };

  const skip = (page - 1) * limit;
  const tickets = await SupportTicket.find(query)
    .sort({ createdAt: -1 })
    .populate('userId', 'name email role')
    .skip(skip)
    .limit(limit);
  const total = await SupportTicket.countDocuments(query);

  return { tickets, total };
};

const updateSupportTicketStatus = async (id: string, status: 'open' | 'in_progress' | 'resolved' | 'closed'): Promise<ISupportTicket | null> => {
  const supportTicket = await SupportTicket.findById(id);
  if (!supportTicket) {
    throw new AppError(httpStatus.NOT_FOUND, 'Support ticket not found');
  }

  supportTicket.status = status;
  await supportTicket.save();

  return SupportTicket.findById(id).populate('userId', 'name email');
};

export const SupportTicketService = {
  createSupportTicket,
  addMessageToTicket,
  getUserSupportTickets,
  getAllSupportTickets,
  updateSupportTicketStatus,
};