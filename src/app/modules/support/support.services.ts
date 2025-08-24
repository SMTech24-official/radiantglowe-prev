import httpStatus from 'http-status';
import config from '../../config';
import AppError from '../../error/appError';
import { sendAdminEmail, sendEmail } from '../../utils/sendEmail';
import { ISupport } from './support.interface';
import { Support } from './support.model';
import { emailVariable } from '../../utils/constantValue';

interface IPayload {
  name?: string;
  email: string;
  message: string;
  phoneNumber?: string;
  messageType?: string;
}
const createSupportMessage = async (
  userId: string | undefined, // userId is optional for unauthenticated users
  payload: IPayload
): Promise<ISupport> => {
  const supportMessage = await Support.create({
    userId, // Will be undefined for unauthenticated users
    name: payload.name,
    email: payload.email,
    message: payload.message,
    phoneNumber: payload.phoneNumber,
    messageType: payload.messageType,
    status: 'open',
  });

  // Email to the user (confirmation)
  await sendEmail(
    payload.email,
    'We Have Received Your Support Request',
    `
      <div style="font-family: Arial, sans-serif; line-height: 1.6; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 8px; background-color: #fafafa;">
       ${emailVariable.headerLogo}
        <h2 style="color: #333; text-align: center;">Support Request Received</h2>
        <p style="color: #555;">Dear ${payload.name || 'Valued User'},</p>
        <p style="color: #555;">
          Thank you for reaching out to our support team. We have successfully received your message.
        </p>
        <p style="color: #555;">
          Our support team is currently reviewing your request and will get back to you as soon as possible.
          In the meantime, please keep an eye on your inbox for updates.
        </p>
        <p style="color: #555;">
          If you need to provide additional information, you can reply directly to this email or contact us at
          <a href="mailto:${config.SUPPORT_EMAIL}" style="color: #007BFF;">${config.SUPPORT_EMAIL}</a>.
        </p>
        <p style="color: #555;">Best regards,<br>${emailVariable.regards}</p>
        <hr style="border-top: 1px solid #e0e0e0; margin: 20px 0;">
        ${emailVariable.footer}
      </div>
    `
  );

  // Email to the support team
  await sendAdminEmail(
    config.SUPPORT_EMAIL ?? 'info@simpleroomsng.com',
    'New Support Request Received',
    `
      <div style="font-family: Arial, sans-serif; line-height: 1.6; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 8px; background-color: #ffffff;">
        <h2 style="color: #333; text-align: center;">New Support Request</h2>
        <p style="color: #555;">Dear Support Team,</p>
        <p style="color: #555;">
          A new support request has been received with the following details:
        </p>
        <table style="width: 100%; border-collapse: collapse; margin: 20px 0;">
          <tr>
            <td style="padding: 8px; font-weight: bold; color: #333; border-bottom: 1px solid #e0e0e0;">Name:</td>
            <td style="padding: 8px; color: #555; border-bottom: 1px solid #e0e0e0;">${payload.name || 'Not provided'}</td>
          </tr>
          <tr>
            <td style="padding: 8px; font-weight: bold; color: #333; border-bottom: 1px solid #e0e0e0;">Email:</td>
            <td style="padding: 8px; color: #555; border-bottom: 1px solid #e0e0e0;">${payload.email}</td>
          </tr>
          ${payload.phoneNumber ? `
          <tr>
            <td style="padding: 8px; font-weight: bold; color: #333; border-bottom: 1px solid #e0e0e0;">Phone Number:</td>
            <td style="padding: 8px; color: #555; border-bottom: 1px solid #e0e0e0;">${payload.phoneNumber}</td>
          </tr>
          ` : ''}
          <tr>
            <td style="padding: 8px; font-weight: bold; color: #333; border-bottom: 1px solid #e0e0e0;">Message Type:</td>
            <td style="padding: 8px; color: #555; border-bottom: 1px solid #e0e0e0;">${payload.messageType || 'Not specified'}</td>
          </tr>
          <tr>
            <td style="padding: 8px; font-weight: bold; color: #333; border-bottom: 1px solid #e0e0e0;">Message:</td>
            <td style="padding: 8px; color: #555; border-bottom: 1px solid #e0e0e0;">${payload.message}</td>
          </tr>
          ${userId ? `
          <tr>
            <td style="padding: 8px; font-weight: bold; color: #333; border-bottom: 1px solid #e0e0e0;">User ID:</td>
            <td style="padding: 8px; color: #555; border-bottom: 1px solid #e0e0e0;">${userId}</td>
          </tr>
          ` : ''}
        </table>
        <p style="color: #555;">
          Please review the request and respond to the user promptly. You can reach them at
          <a href="mailto:${payload.email}" style="color: #007BFF;">${payload.email}</a>.
        </p>
        <p style="color: #555;">Best regards,<br>${emailVariable.regards}</p>
        <hr style="border-top: 1px solid #e0e0e0; margin: 20px 0;">
        ${emailVariable.footer}
      </div>
    `
  );

  return supportMessage;
};

const getUserSupportMessages = async (userId: string, page: number, limit: number) => {
  const skip = (page - 1) * limit;
  const messages = await Support.find({ userId })
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit)
  const total = await Support.countDocuments({ userId });

  return { messages, total };
};

const getAllSupportMessages = async (
  filters: { userId?: string; email?: string; status?: 'open' | 'resolved' },
  page: number,
  limit: number
) => {
  const query: any = {};
  if (filters.userId) query.userId = filters.userId;
  if (filters.email) query.email = { $regex: filters.email, $options: 'i' };
  if (filters.status) query.status = filters.status;

  const skip = (page - 1) * limit;
  const messages = await Support.find(query)
    .sort({ createdAt: -1 })
    .populate('userId', 'name email role')
    .skip(skip)
    .limit(limit);
  const total = await Support.countDocuments(query);

  return { messages, total };
};

const updateSupportMessageStatus = async (id: string, status: 'open' | 'resolved'): Promise<ISupport | null> => {
  const supportMessage = await Support.findById(id);
  if (!supportMessage) {
    throw new AppError(httpStatus.NOT_FOUND, 'Support message not found');
  }

  supportMessage.status = status;
  await supportMessage.save();

  return Support.findById(id).populate('userId', 'name email');
};

export const SupportService = {
  createSupportMessage,
  getUserSupportMessages,
  getAllSupportMessages,
  updateSupportMessageStatus,
};