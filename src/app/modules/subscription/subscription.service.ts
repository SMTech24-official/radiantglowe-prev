import httpStatus from 'http-status';
import { Document, Types } from 'mongoose';
import { Paystack } from 'paystack-sdk';
import config from '../../config';
import AppError from '../../error/appError';
import { sendAdminEmail, sendEmail } from '../../utils/sendEmail';
import { Package } from '../package/package.model';
import { Property } from '../property/property.model';
import { User } from '../user/user.model';
import { ISubscription } from './subscription.interface';
import { Subscription } from './subscription.model';
import e from 'express';
import { emailVariable } from '../../utils/constantValue';

// Initialize Paystack
const paystack = new Paystack(config.PAYSTACK_SECRET_KEY!);

interface ISubscriptionDocument extends ISubscription, Document { }

const createSubscription = async (landlordId: string, subscriptionData: {
  package: string;
  price?: number;
  paymentMethodId?: string;
}): Promise<ISubscription> => {
  const packageDoc = await Package.findById(subscriptionData.package);
  if (!packageDoc) {
    throw new AppError(httpStatus.NOT_FOUND, 'Package not found');
  }

  const user = await User.findById(landlordId);
  if (!user || user.role !== 'landlord') {
    throw new AppError(httpStatus.FORBIDDEN, 'Invalid landlord');
  }

  const startDate = new Date();
  let endDate = new Date(startDate);

  if (typeof packageDoc.durationInDays === 'number') {
    endDate.setDate(startDate.getDate() + packageDoc.durationInDays);
  } else {
    endDate.setFullYear(9999);
  }

  const subscriptionPayload: ISubscription = {
    landlord: new Types.ObjectId(landlordId),
    package: new Types.ObjectId(subscriptionData.package),
    status: 'pending',
    state: packageDoc.state,
    startDate,
    endDate,
  };


  if (packageDoc.state === 'PAID') {
    if (packageDoc.isFreePromo) {
      subscriptionPayload.status = 'active';
    } else {
      if (!subscriptionData.price || !subscriptionData.paymentMethodId) {
        throw new AppError(httpStatus.BAD_REQUEST, 'Price and paymentMethodId are required for PAID packages');
      }

      try {
        const payment = await paystack.transaction.verify(subscriptionData.paymentMethodId);
        if (!payment.data || !payment.data.status) {
          throw new AppError(httpStatus.BAD_REQUEST, 'Payment verification failed');
        }

        subscriptionPayload.paymentIntentId = subscriptionData.paymentMethodId;
        subscriptionPayload.status = 'active';
      } catch (error) {
        throw new AppError(httpStatus.BAD_REQUEST, 'Payment failed: ' + (error as Error).message);
      }
    }
  } else {
    subscriptionPayload.status = 'active';
  }

  // Check for existing subscription
  let subscription: ISubscriptionDocument;
  // const existingSubscription = await Subscription.findOne({ landlord: landlordId });
  // if (existingSubscription) {
  //   subscriptionPayload.previousPackage = existingSubscription.package;
  //   subscription = await Subscription.findByIdAndUpdate(
  //     existingSubscription._id,
  //     subscriptionPayload,
  //     { new: true, runValidators: true }
  //   ).populate('landlord package') as ISubscriptionDocument;
  // } else {
  //   subscription = await Subscription.create(subscriptionPayload);
  // }

  const existingSubscription = await Subscription.findOne({ landlord: landlordId });

  if (existingSubscription) {
    subscriptionPayload.previousPackage = existingSubscription.package;
  }

  subscription = await Subscription.create(subscriptionPayload);
  // Send email to landlord if subscription is active
  if (subscription.status === 'active') {
    await sendEmail(
      user.email,
      'Subscription Activated',
      `
        <div style="font-family: Arial, sans-serif; line-height: 1.6; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 8px;">
         ${emailVariable.headerLogo}
          <h2 style="color: #333; text-align: center;">Subscription Activated!</h2>
          <p style="color: #555;">Dear ${user.name},</p>
          <p style="color: #555;">Thank you for subscribing to the "${packageDoc.name}" package on our platform. Your subscription is now active!</p>
          <p style="color: #555;">Details:</p>
          <ul style="color: #555;">
            <li><strong>Package:</strong> ${packageDoc.name}</li>
            <li><strong>Start Date:</strong> ${startDate.toDateString()}</li>
            <li><strong>End Date:</strong> ${endDate.getFullYear() === 9999 ? 'Unlimited' : endDate.toDateString()}</li>
            <li><strong>Status:</strong> Active</li>
          </ul>
          <p style="color: #555;">You can now enjoy the benefits of your subscription, including listing properties as per your package limits. Manage your subscription through your landlord dashboard.</p>
          <p style="color: #555;">If you have any questions or need assistance, please contact our support team at <a href="mailto:${config.SUPPORT_EMAIL}" style="color: #007BFF;">${config.SUPPORT_EMAIL}</a>.</p>
          <p style="color: #555;">Best regards,<br>${emailVariable.regards}</p>
       <hr style="border-top: 1px solid #e0e0e0; margin: 20px 0;">
       ${emailVariable.footer}
        </div>
      `
    );
    await sendAdminEmail(
      '',
      'New Subscription Activated',
      `
    <div style="font-family: Arial, sans-serif; line-height: 1.6; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 8px;">
      ${emailVariable.headerLogo}
      <h2 style="color: #333; text-align: center;">New Subscription Activated!</h2>
      <p style="color: #555;">Hello Admin,</p>
      <p>A new subscription has been activated by <strong>${user.name}</strong> (Email: ${user.email}).</p>

      <h3>Subscription Details:</h3>
      <ul style="color: #555;">
        <li><strong>User:</strong> ${user.name} (${user.email})</li>
        <li><strong>Package:</strong> ${packageDoc.name}</li>
        <li><strong>Start Date:</strong> ${startDate.toDateString()}</li>
        <li><strong>End Date:</strong> ${endDate.getFullYear() === 9999 ? 'Unlimited' : endDate.toDateString()}</li>
        <li><strong>Status:</strong> Active</li>
      </ul>

      <p style="color: #555;">Please review the subscription and ensure the account is properly updated in the system.</p>
      <p style="color: #555;">If you have any questions, contact the support team at <a href="mailto:${config.SUPPORT_EMAIL}" style="color: #007BFF;">${config.SUPPORT_EMAIL}</a>.</p>
      <p style="color: #555;">Regards,<br>${emailVariable.regards}</p>
      <hr style="border-top: 1px solid #e0e0e0; margin: 20px 0;">
      ${emailVariable.footer}
    </div>
  `
    );

  }

  return subscription;
};

const getSubscriptions = async (): Promise<ISubscription[]> => {
  const subscriptions = await Subscription.find()
    .sort({ createdAt: -1 })
    .populate('landlord', 'name email')
    .populate('package')
    .populate('previousPackage');
  return subscriptions;
};
const getLandlordSubscriptions = async (
  landlordId: string
): Promise<ISubscription[]> => {
  const subscriptions = await Subscription.find({ landlord: landlordId })
    .sort({ createdAt: -1 })
    .populate('landlord', '-password -confirmPassword')
    .populate('package')
    .populate('previousPackage');

  if (!subscriptions || subscriptions.length === 0) {
    return [];
  }

  const latestSubscription = subscriptions[0];

  if (
    latestSubscription.endDate < new Date() &&
    latestSubscription.status !== 'canceled'
  ) {
    // Cancel the latest subscription
    latestSubscription.status = 'canceled';
    await latestSubscription.save();

    await Property.updateMany(
      { landlord: landlordId },
      { $set: { isActive: false } }
    );
  }

  return subscriptions;
};



const getSingleSubscription = async (id: string, userId: string, userRole: string): Promise<ISubscription | null> => {
  const subscription = await Subscription.findById(id).populate('landlord package');
  if (!subscription) {
    throw new AppError(httpStatus.NOT_FOUND, 'Subscription not found');
  }
  if (userRole !== 'admin' && userRole !== 'landlord') {
    throw new AppError(httpStatus.FORBIDDEN, 'Unauthorized access to subscription');
  }
  return subscription;
};

const updateSubscription = async (id: string, updatedData: Partial<ISubscription>): Promise<ISubscription | null> => {
  const subscription = await Subscription.findById(id);
  if (!subscription) {
    throw new AppError(httpStatus.NOT_FOUND, 'Subscription not found');
  }

  if (updatedData.package) {
    const packageDoc = await Package.findById(updatedData.package);
    if (!packageDoc) {
      throw new AppError(httpStatus.NOT_FOUND, 'Package not found');
    }
    updatedData.state = packageDoc.state;
    updatedData.previousPackage = subscription.package;
    const startDate = new Date();
    updatedData.startDate = startDate;
    updatedData.endDate = new Date(startDate);
    if (typeof packageDoc.durationInDays === 'number') {
      updatedData.endDate.setDate(startDate.getDate() + packageDoc.durationInDays);
    } else {
      updatedData.endDate.setFullYear(9999);
    }
  }

  const updatedSubscription = await Subscription.findByIdAndUpdate(id, updatedData, {
    new: true,
    runValidators: true,
  }).populate('landlord package');
  return updatedSubscription;
};

const deleteSubscription = async (id: string): Promise<ISubscription | null> => {
  const subscription = await Subscription.findByIdAndDelete(id).populate('landlord package');
  if (!subscription) {
    throw new AppError(httpStatus.NOT_FOUND, 'Subscription not found');
  }
  return subscription;
};

const refundSubscription = async (id: string, reason?: string): Promise<ISubscription | null> => {
  const subscription = await Subscription.findById(id).populate('landlord package');
  if (!subscription) {
    throw new AppError(httpStatus.NOT_FOUND, 'Subscription not found');
  }

  if (subscription.state !== 'PAID' || !subscription.paymentIntentId) {
    throw new AppError(httpStatus.BAD_REQUEST, 'Subscription is not eligible for a refund');
  }

  if (subscription.status === 'refunded') {
    throw new AppError(httpStatus.BAD_REQUEST, 'Subscription is already refunded');
  }

  try {
    // Create refund using Paystack
    const refund = await paystack.refund.create({
      transaction: subscription.paymentIntentId,
      ...(reason && { reason }),
    });

    if (!refund.data || refund.data.status !== 'processed' || !refund.status) {
      throw new AppError(httpStatus.BAD_REQUEST, 'Refund processing failed');
    }

    // Update subscription status to 'refunded'
    const updatedSubscription = await Subscription.findByIdAndUpdate(
      id,
      { status: 'refunded', refundReason: reason || 'No reason provided' },
      { new: true, runValidators: true }
    ).populate('landlord package') as ISubscriptionDocument;

    // Send email to landlord
    const user = await User.findById(subscription.landlord);
    if (user) {
      await sendEmail(
        user.email,
        'Subscription Refund Processed',
        `
          <div style="font-family: Arial, sans-serif; line-height: 1.6; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 8px;">
           ${emailVariable.headerLogo}
            <h2 style="color: #333; text-align: center;">Subscription Refund Processed</h2>
            <p style="color: #555;">Dear ${user.name},</p>
            <p style="color: #555;">We have processed a refund for your "${(subscription.package as any).name}" subscription on our platform.</p>
            <p style="color: #555;">Details:</p>
            <ul style="color: #555;">
              <li><strong>Package:</strong> ${(subscription.package as any).name}</li>
              <li><strong>Refund Date:</strong> ${new Date().toDateString()}</li>
              ${reason ? `<li><strong>Reason:</strong> ${reason}</li>` : ''}
              <li><strong>Status:</strong> Refunded</li>
            </ul>
            <p style="color: #555;">The refund amount will be credited to your original payment method. Please allow a few business days for the transaction to complete.</p>
            <p style="color: #555;">If you have any questions or need assistance, please contact our support team at <a href="mailto:${config.SUPPORT_EMAIL}" style="color: #007BFF;">${config.SUPPORT_EMAIL}</a>.</p>
            <p style="color: #555;">Best regards,<br>${emailVariable.regards}</p>
            <hr style="border-top: 1px solid #e0e0e0; margin: 20px 0;">
            ${emailVariable.footer}
          </div>
        `
      );
    }

    return updatedSubscription;
  } catch (error) {
    throw new AppError(httpStatus.BAD_REQUEST, 'Refund failed: ' + (error as Error).message);
  }
};



export const SubscriptionService = {
  createSubscription,
  getSubscriptions,
  getLandlordSubscriptions,
  getSingleSubscription,
  updateSubscription,
  deleteSubscription,
  refundSubscription,
};