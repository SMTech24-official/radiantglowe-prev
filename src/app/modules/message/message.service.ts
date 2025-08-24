import httpStatus from 'http-status';
import { Types } from 'mongoose';
import AppError from '../../error/appError';
import { emailVariable } from '../../utils/constantValue';
import { sendEmail } from '../../utils/sendEmail';
import { Property } from '../property/property.model';
import { User } from '../user/user.model';
import { IMessage } from './message.interface';
import { Message } from './message.model';

const createMessage = async (
  senderId: string,
  payload: { receiverId: string; propertyId: string; message?: string; imageUrl?: string }
): Promise<IMessage> => {
  // Fetch sender, receiver, and property details
  const sender = await User.findById(senderId).select('name email role phoneNumber');
  if (!sender) {
    throw new AppError(httpStatus.NOT_FOUND, 'Sender not found');
  }

  const receiver = await User.findById(payload.receiverId).select('name email role phoneNumber');
  if (!receiver) {
    throw new AppError(httpStatus.NOT_FOUND, 'Receiver not found');
  }

  if (sender.role === receiver.role) {
    throw new AppError(httpStatus.BAD_REQUEST, 'Sender and receiver must have different roles (tenant and landlord)');
  }

  if (sender.role !== 'tenant' && sender.role !== 'landlord') {
    throw new AppError(httpStatus.FORBIDDEN, 'Only tenants and landlords can send messages');
  }

  const property = await Property.findById(payload.propertyId);
  if (!property) {
    throw new AppError(httpStatus.NOT_FOUND, 'Property not found');
  }

  // Validate roles and property ownership
  // if (sender.role === 'tenant') {
  //     if (!property.landlordId.equals(payload.receiverId)) {
  //         throw new AppError(httpStatus.BAD_REQUEST, 'Receiver must be the landlord of the property');
  //     }
  // } else if (sender.role === 'landlord') {
  //     if (!property.landlordId.equals(senderId)) {
  //         throw new AppError(httpStatus.FORBIDDEN, 'You must be the landlord of the property');
  //     }
  // }

  // Check if this is the first message in the conversation
  const existingMessagesCount = await Message.countDocuments({
    propertyId: payload.propertyId,
    $or: [
      { senderId, receiverId: payload.receiverId },
      { senderId: payload.receiverId, receiverId: senderId },
    ],
  });

  const isFirstMessage = existingMessagesCount === 0;

  // Create the message
  const message = await Message.create({
    senderId,
    receiverId: payload.receiverId,
    propertyId: payload.propertyId,
    message: payload.message,
    imageUrl: payload.imageUrl,
    isRead: false,
  });

  // Send emails only if it's the first message from a tenant
  if (isFirstMessage && sender.role === 'tenant') {
    // sms

    // await SMSService.sendSMS({ to: sender.phoneNumber, body: 'Your message has been received' });
    // await SMSService.sendSMS({ to: receiver.phoneNumber, body: 'You have a new message from a tenant' });

    // Email to tenant (confirmation)
    await sendEmail(
      sender.email,
      'Your Message Has Been Received',
      `
        <div style="font-family: Arial, sans-serif; line-height: 1.6; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 8px; background-color: #fafafa;">
         ${emailVariable.headerLogo}
          <h2 style="color: #333; text-align: center;">Message Received</h2>
          <p style="color: #555;">Dear ${sender.name},</p>
          <p style="color: #555;">
            Thank you for your interest in the property "${property.headlineYourProperty}". Your message has been successfully sent to the landlord.
          </p>
          <p style="color: #555;">
            Please wait for the landlord to respond within 24 hours. In the meantime, keep an eye on your inbox for updates.
          </p>
          <p style="color: #555;">Best regards,<br>${emailVariable.regards}</p>
          <hr style="border-top: 1px solid #e0e0e0; margin: 20px 0;">
          ${emailVariable.footer}
        </div>
      `
    )
    // Email to landlord (notification)
    await sendEmail(
      receiver.email,
      'New Message Received Regarding Your Property',
      `
        <div style="font-family: Arial, sans-serif; line-height: 1.6; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 8px; background-color: #ffffff;">
         ${emailVariable.headerLogo}
          <h2 style="color: #333; text-align: center;">New Message</h2>
          <p style="color: #555;">Dear ${receiver.name},</p>
          <p style="color: #555;">
            You have received a new message from a tenant regarding your property "${property.headlineYourProperty}".
          </p>
          <table style="width: 100%; border-collapse: collapse; margin: 20px 0;">
            <tr>
              <td style="padding: 8px; font-weight: bold; color: #333; border-bottom: 1px solid #e0e0e0;">Tenant Name:</td>
              <td style="padding: 8px; color: #555; border-bottom: 1px solid #e0e0e0;">${sender.name}</td>
            </tr>
            <tr>
              <td style="padding: 8px; font-weight: bold; color: #333; border-bottom: 1px solid #e0e0e0;">Tenant Email:</td>
              <td style="padding: 8px; color: #555; border-bottom: 1px solid #e0e0e0;">${sender.email}</td>
            </tr>
            ${payload.message ? `
            <tr>
              <td style="padding: 8px; font-weight: bold; color: #333; border-bottom: 1px solid #e0e0e0;">Message:</td>
              <td style="padding: 8px; color: #555; border-bottom: 1px solid #e0e0e0;">${payload.message}</td>
            </tr>
            ` : ''}
            ${payload.imageUrl ? `
            <tr>
              <td style="padding: 8px; font-weight: bold; color: #333; border-bottom: 1px solid #e0e0e0;">Image:</td>
              <td style="padding: 8px; color: #555; border-bottom: 1px solid #e0e0e0;">
                <a href="${payload.imageUrl}" style="color: #007BFF;">View Image</a>
              </td>
            </tr>
            ` : ''}
          </table>
          <p style="color: #555;">
            Please respond to the tenant promptly. You can reply directly through the platform.
          </p>
          <p style="color: #555;">Best regards,<br>${emailVariable.regards}</p>
          <hr style="border-top: 1px solid #e0e0e0; margin: 20px 0;">
          ${emailVariable.footer}
        </div>
      `
    );
  } else if (sender.role === 'tenant') {
    // Email to landlord (notification)
    await sendEmail(
      receiver.email,
      'New Message Received',
      `
        <div style="font-family: Arial, sans-serif; line-height: 1.6; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 8px; background-color: #ffffff;">
         ${emailVariable.headerLogo}
          <h2 style="color: #333; text-align: center;">New Message</h2>
          <p style="color: #555;">Dear ${receiver.name},</p>
          <p style="color: #555;">
            You have received a new message from a tenant regarding your property "${property.headlineYourProperty}".
          </p>
          <table style="width: 100%; border-collapse: collapse; margin: 20px 0;">
            <tr>
              <td style="padding: 8px; font-weight: bold; color: #333; border-bottom: 1px solid #e0e0e0;">Tenant Name:</td>
              <td style="padding: 8px; color: #555; border-bottom: 1px solid #e0e0e0;">${sender.name}</td>
            </tr>
            <tr>
              <td style="padding: 8px; font-weight: bold; color: #333; border-bottom: 1px solid #e0e0e0;">Tenant Email:</td>
              <td style="padding: 8px; color: #555; border-bottom: 1px solid #e0e0e0;">${sender.email}</td>
            </tr>
            ${payload.message ? `
            <tr>
              <td style="padding: 8px; font-weight: bold; color: #333; border-bottom: 1px solid #e0e0e0;">Message:</td>
              <td style="padding: 8px; color: #555; border-bottom: 1px solid #e0e0e0;">${payload.message}</td>
            </tr>
            ` : ''}
            ${payload.imageUrl ? `
            <tr>
              <td style="padding: 8px; font-weight: bold; color: #333; border-bottom: 1px solid #e0e0e0;">Image:</td>
              <td style="padding: 8px; color: #555; border-bottom: 1px solid #e0e0e0;">
                <a href="${payload.imageUrl}" style="color: #007BFF;">View Image</a>
              </td>
            </tr>
            ` : ''}
          </table>
          <p style="color: #555;">
            Please respond to the tenant promptly. You can reply directly through the platform.
          </p>
          <p style="color: #555;">Best regards,<br>${emailVariable.regards}</p>
          <hr style="border-top: 1px solid #e0e0e0; margin: 20px 0;">
          ${emailVariable.footer}
        </div>
      `
    );
    // await SMSService.sendSMS({ to: receiver.phoneNumber, body: 'You have a new message from a tenant' });
  } else if (sender.role === 'landlord') {
    // Email to landlord (notification)
    await sendEmail(
      receiver.email,
      'New Message Regarding Your Property',
      `
  <div style="font-family: Arial, sans-serif; line-height: 1.6; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 8px; background-color: #ffffff;">
   ${emailVariable.headerLogo}
    <h2 style="color: #333; text-align: center;">You Have a New Message!</h2>
    <p style="color: #555;">Hi ${receiver.name},</p>
    <p style="color: #555;">
      You received a new message from a landlord regarding your interest in the property: "<strong>${property.headlineYourProperty}</strong>".
    </p>

    <table style="width: 100%; border-collapse: collapse; margin: 20px 0;">
      <tr>
        <td style="padding: 8px; font-weight: bold; color: #333; border-bottom: 1px solid #e0e0e0;">Landlord Name:</td>
        <td style="padding: 8px; color: #555; border-bottom: 1px solid #e0e0e0;">${sender.name}</td>
      </tr>
      <tr>
        <td style="padding: 8px; font-weight: bold; color: #333; border-bottom: 1px solid #e0e0e0;">Landlord Email:</td>
        <td style="padding: 8px; color: #555; border-bottom: 1px solid #e0e0e0;">${sender.email}</td>
      </tr>
      ${payload.message ? `
      <tr>
        <td style="padding: 8px; font-weight: bold; color: #333; border-bottom: 1px solid #e0e0e0;">Message:</td>
        <td style="padding: 8px; color: #555; border-bottom: 1px solid #e0e0e0;">${payload.message}</td>
      </tr>
      ` : ''}
      ${payload.imageUrl ? `
      <tr>
        <td style="padding: 8px; font-weight: bold; color: #333; border-bottom: 1px solid #e0e0e0;">Image:</td>
        <td style="padding: 8px; color: #555; border-bottom: 1px solid #e0e0e0;">
          <a href="${payload.imageUrl}" style="color: #007BFF; text-decoration: none;">View Image</a>
        </td>
      </tr>
      ` : ''}
    </table>

    <p style="color: #555;">
      Please check the message and respond promptly through our simple rooms.
    </p>

    <p style="color: #555;">Thank you,<br><strong>${emailVariable.regards}</strong></p>

    <hr style="border-top: 1px solid #e0e0e0; margin: 20px 0;">
    ${emailVariable.footer}
  </div>
  `
    );
    // await SMSService.sendSMS({ to: receiver.phoneNumber, body: 'You have a new message from a landlord' });
  }


  return message;
};

const getMessages = async (userId: string, otherUserId: string, propertyId: string) => {
  const query = {
    propertyId,
    $or: [
      { senderId: userId, receiverId: otherUserId },
      { senderId: otherUserId, receiverId: userId },
    ],
  };
  const messages = await Message.find(query)
    .sort({ createdAt: 1 })
    .populate('senderId', 'name email')
    .populate('receiverId', 'name email');

  // Mark messages as read if they are unread and received by the current user
  await Message.updateMany(
    { receiverId: userId, isRead: false, propertyId },
    { $set: { isRead: true } }
  );

  return messages;
};

const getConversations = async (userId: string) => {
  const userObjectId = new Types.ObjectId(userId);

  // Aggregation for conversations
  const conversations = await Message.aggregate([
    {
      $match: {
        $or: [{ senderId: userObjectId }, { receiverId: userObjectId }],
      },
    },
    {
      $sort: { createdAt: -1 },
    },
    {
      $group: {
        _id: {
          propertyId: '$propertyId',
          otherId: {
            $cond: [{ $eq: ['$senderId', userObjectId] }, '$receiverId', '$senderId'],
          },
        },
        lastMessage: { $first: '$message' },
        lastImageUrl: { $first: '$imageUrl' },
        lastMessageTime: { $first: '$createdAt' },
        unreadCount: {
          $sum: {
            $cond: [
              { $and: [{ $eq: ['$receiverId', userObjectId] }, { $eq: ['$isRead', false] }] },
              1,
              0,
            ],
          },
        },
      },
    },
    {
      $sort: { lastMessageTime: -1 },
    },
    {
      $lookup: {
        from: 'users',
        localField: '_id.otherId',
        foreignField: '_id',
        as: 'otherUser',
      },
    },
    {
      $unwind: '$otherUser',
    },
    {
      $lookup: {
        from: 'properties',
        localField: '_id.propertyId',
        foreignField: '_id',
        as: 'property',
      },
    },
    {
      $unwind: '$property',
    },
    {
      $project: {
        otherUser: {
          _id: 1, name: 1, email: 1, role: 1, image: 1, address: 1, isVerified: 1, profileVerificationImage: 1,
        },
        property: { _id: 1, headlineYourProperty: 1 },
        lastMessage: 1,
        lastImageUrl: 1,
        lastMessageTime: 1,
        unreadCount: 1,
      },
    },
  ]);

  return conversations;
};

const getAdminMessages = async (userId1: string, userId2: string, propertyId: string) => {
  const query = {
    propertyId,
    $or: [
      { senderId: userId1, receiverId: userId2 },
      { senderId: userId2, receiverId: userId1 },
    ],
  };
  const messages = await Message.find(query)
    .sort({ createdAt: 1 })
    .populate('senderId', 'name email role')
    .populate('receiverId', 'name email role');

  return messages;
};

const getMessagingTenants = async (landlordId: string) => {
  const landlordObjectId = new Types.ObjectId(landlordId);

  // Aggregation to get unique tenants who messaged the landlord
  const tenants = await Message.aggregate([
    {
      $match: {
        $or: [
          { receiverId: landlordObjectId },
          { senderId: landlordObjectId }
        ],
      },
    },
    {
      $lookup: {
        from: 'users',
        localField: 'senderId',
        foreignField: '_id',
        as: 'sender',
      },
    },
    {
      $lookup: {
        from: 'users',
        localField: 'receiverId',
        foreignField: '_id',
        as: 'receiver',
      },
    },
    {
      $unwind: '$sender',
    },
    {
      $unwind: '$receiver',
    },
    {
      $group: {
        _id: {
          tenantId: {
            $cond: [{ $eq: ['$senderId', landlordObjectId] }, '$receiverId', '$senderId'],
          },
        },
        tenant: {
          $first: {
            $cond: [
              { $eq: ['$senderId', landlordObjectId] },
              {
                _id: '$receiver._id',
                name: '$receiver.name',
                email: '$receiver.email',
                role: '$receiver.role',
                image: '$receiver.image',
                address: '$receiver.address',
                isVerified: '$receiver.isVerified'
              },
              {
                _id: '$sender._id',
                name: '$sender.name',
                email: '$sender.email',
                role: '$sender.role',
                image: '$sender.image',
                address: '$sender.address',
                isVerified: '$sender.isVerified'
              },
            ],
          },
        },
        joinDate: { $min: '$createdAt' },
      },
    },
    {
      $sort: { joinDate: -1 },
    },
    {
      $project: {
        tenant: { _id: 1, name: 1, email: 1, role: 1, image: 1, address: 1, isVerified: 1 },
        joinDate: 1,
      },
    },
  ]);

  return tenants;
};
export const MessageService = {
  createMessage,
  getMessages,
  getConversations,
  getAdminMessages,
  getMessagingTenants
};
