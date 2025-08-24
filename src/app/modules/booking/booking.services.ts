import httpStatus from 'http-status';
import mongoose from 'mongoose';
import { Paystack } from 'paystack-sdk';
import config from '../../config';
import AppError from '../../error/appError';
import { Permission } from '../permission/permission.model';
import { Property } from '../property/property.model';
import { IBooking } from './booking.interface';
import { Booking } from './booking.model';
import { generateInvoicePDF } from './booking.utils';
import { sendEmail } from '../../utils/sendEmail';
import { User } from '../user/user.model';
import { emailVariable } from '../../utils/constantValue';


interface ITransaction {
  message?: string;
  redirecturl?: string;
  reference: string;
  status: string;
  trans?: string;
  transaction: string;
  trxref?: string;
}

// Initialize Paystack
const paystack = new Paystack(config.PAYSTACK_SECRET_KEY!);

const createBooking = async (
  tenantId: string,
  landlordId: string,
  propertyId: string,
  permissionId: string,
  paymentMethod: 'online' | 'offline',
  transaction?: ITransaction,
  amount?: number
): Promise<IBooking> => {
  // Check property availability
  const property = await Property.findById(propertyId);
  if (!property) {
    throw new AppError(httpStatus.NOT_FOUND, 'Property not found');
  }

  const UserProfile = await User.findById(tenantId).select('email name');

  // Check for existing booking
  const existingBooking = await Booking.findOne({ propertyId }).populate('propertyId', 'status');
  if ((existingBooking as any)?.propertyId?.status === 'rented' || (existingBooking as any)?.propertyId.status === 'booking') {
    throw new AppError(httpStatus.BAD_REQUEST, 'Property is booking ongoing or Rented. Please contact the landlord');
  }

  const session = await mongoose.startSession();
  session.startTransaction();
  let paymentinfo = null
  try {
    let paymentStatus: 'pending' | 'completed' | 'failed' = 'pending';
    let transactionData: any = null;

    // Handle online payment
    if (paymentMethod === 'online') {
      if (!transaction?.reference) {
        throw new AppError(httpStatus.BAD_REQUEST, 'Reference is required for online payment');
      }
      const payment = await paystack.transaction.verify(transaction.reference);
      if (!payment.data || payment.data.status !== 'success') {
        throw new AppError(httpStatus.BAD_REQUEST, 'Payment verification failed');
      }
      paymentStatus = 'completed';

      paymentinfo = payment.data

      transactionData = {
        message: transaction?.message,
        reference: transaction?.reference,
        status: transaction?.status,
        trans: transaction?.trans,
        transaction: transaction?.transaction,
        trxref: transaction?.trxref,
      };
    }

    // Create booking
    const booking = await Booking.create(
      [
        {
          tenantId,
          landlordId,
          propertyId,
          permissionId,
          paymentMethod,
          paymentStatus,
          amount: amount || property.rentPerMonth,
          bookingDate: new Date(),
          paymentDate: paymentMethod === 'online' ? new Date() : undefined,
          transaction: transactionData, // Save the transaction object
          paymentInfo: paymentMethod === 'online' ? paymentinfo : null,
        },
      ],
      { session }
    );

    // Update property status to rented
    if (paymentMethod === 'online') {
      property.status = 'rented';
      await property.save({ session });
    }
    if (paymentMethod === 'offline') {
      property.status = 'booking';
      await property.save({ session });
    }

    await session.commitTransaction();

    await sendEmail(
      UserProfile?.email || "user@example.com", // tenant er email
      "Booking Confirmed - " + property.headlineYourProperty,
      `
    <div style="font-family: Arial, sans-serif; line-height: 1.6;">
      ${emailVariable.headerLogo}
      <p>Dear ${UserProfile?.name || "User"},</p>
      <p>Congratulations! 🎉 Your booking has been <strong>successfully confirmed</strong>.</p>
      
      <h3>Booking Details:</h3>
      <ul>
        <li><strong>Property:</strong> ${property.headlineYourProperty}</li>
        <li><strong>Amount Paid:</strong> ${booking[0].amount} (${booking[0].paymentMethod})</li>
        <li><strong>Booking Date:</strong> ${booking[0].bookingDate.toDateString()}</li>
        ${booking[0].paymentDate
        ? `<li><strong>Payment Date:</strong> ${booking[0].paymentDate.toDateString()}</li>`
        : ""
      }
        ${booking[0].transaction?.reference
        ? `<li><strong>Transaction ID:</strong> ${booking[0].transaction.reference}</li>`
        : ""
      }
      </ul>

      <p>We’ll keep you updated with any further information.</p>
      <p>If you have any questions, feel free to contact our support team.</p>

      ${emailVariable.footer}
    </div>
  `
    );

    return booking[0];
  } catch (error) {
    await session.abortTransaction();
    throw error;
  } finally {
    session.endSession();
  }
};

const updateBookingPaymentStatus = async (id: string, landlordId: string): Promise<IBooking | null> => {
  const booking = await Booking.findById(id);
  if (!booking) {
    throw new AppError(httpStatus.NOT_FOUND, 'Booking not found');
  }
  // if (booking.landlordId.toString() !== landlordId) {
  //   throw new AppError(httpStatus.FORBIDDEN, 'Only the landlord can update this booking');
  // }
  if (booking.paymentMethod !== 'offline') {
    throw new AppError(httpStatus.BAD_REQUEST, 'Payment status can only be updated for offline bookings');
  }
  if (booking.paymentStatus === 'completed') {
    throw new AppError(httpStatus.BAD_REQUEST, 'Payment status is already completed');
  }

  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    booking.paymentStatus = 'completed';
    booking.paymentDate = new Date();
    await booking.save({ session });

    const property = await Property.findById(booking.propertyId).session(session);
    if (!property) {
      throw new AppError(httpStatus.NOT_FOUND, 'Property not found');
    }
    property.status = 'rented';
    await property.save({ session });

    await session.commitTransaction();
  } catch (error) {
    await session.abortTransaction();
    throw error;
  } finally {
    session.endSession();
  }

  const populatedBooking = await Booking.findById(id)
    .populate('tenantId', 'name email')
    .populate('landlordId', 'name email')
    .populate('propertyId', 'headlineYourProperty location rentAmount')
    .populate('permissionId', 'PID status');

  return populatedBooking;
};

const getBookings = async (
  filters: { tenantId?: string; landlordId?: string; propertyId?: string; paymentMethod?: string },
  page: number,
  limit: number
) => {
  const query: any = {};
  if (filters.tenantId) query.tenantId = filters.tenantId;
  if (filters.landlordId) query.landlordId = filters.landlordId;
  if (filters.propertyId) query.propertyId = filters.propertyId;
  if (filters.paymentMethod) query.paymentMethod = filters.paymentMethod;

  const skip = (page - 1) * limit;
  const bookings = await Booking.find(query)
    .sort({ bookingDate: -1 })
    .select('-paymentInfo')
    .populate('tenantId', 'name email')
    .populate('landlordId', 'name email')
    .populate('propertyId', 'headlineYourProperty location rentAmount')
    .populate('permissionId', 'PID status')
    .skip(skip)
    .limit(limit);
  const total = await Booking.countDocuments(query);

  return { bookings, total };
};

const getLandlordConfirmedTenants = async (
  landlordId: string,
  filters: { propertyId?: string },
  page: number,
  limit: number
) => {
  const query: any = { landlordId };
  if (filters.propertyId) query.propertyId = filters.propertyId;

  const skip = (page - 1) * limit;
  const bookings = await Booking.find(query)
    .populate('tenantId', 'name email')
    .populate('propertyId', 'headlineYourProperty location rentAmount')
    .skip(skip)
    .limit(limit);
  const total = await Booking.countDocuments(query);

  return { bookings, total };
};

const getSingleBooking = async (id: string): Promise<IBooking | null> => {
  const booking = await Booking.findById(id)
    .populate('tenantId', 'name email')
    .populate('landlordId', 'name email')
    .populate('propertyId', 'headlineYourProperty location rentAmount')
    .populate('permissionId', 'PID status');
  if (!booking) {
    throw new AppError(httpStatus.NOT_FOUND, 'Booking not found');
  }
  return booking;
};

const generateBookingInvoice = async (propertyId: string): Promise<Buffer> => {
  const booking = await Booking.findOne({ propertyId })
    .populate('tenantId', 'name email')
    .populate('landlordId', 'name email')
    .populate('propertyId', 'headlineYourProperty location rentPerMonth')
    .lean();

  if (!booking) {
    throw new AppError(httpStatus.NOT_FOUND, 'Booking not found for this property');
  }

  return await generateInvoicePDF(booking as any);
};


export const BookingService = {
  createBooking,
  updateBookingPaymentStatus,
  getBookings,
  getLandlordConfirmedTenants,
  getSingleBooking,
  generateBookingInvoice,
};