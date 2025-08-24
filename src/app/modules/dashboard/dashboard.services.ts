import { Types } from 'mongoose';
import { Property } from '../property/property.model';
import { Booking } from '../booking/booking.model';
import { User } from '../user/user.model';
import { Subscription } from '../subscription/subscription.model';
import { Package } from '../package/package.model';
import { IAdminDashboard, ILandlordDashboard, IEarningsReport } from './dashboard.interface';
import moment from 'moment';
import { Chat } from '../socket/chat.model';
import AppError from '../../error/appError';
import httpStatus from 'http-status';

const getLandlordDashboardData = async (landlordId: string): Promise<ILandlordDashboard> => {
  const objectId = new Types.ObjectId(landlordId);

  // Total Properties
  const totalProperties = await Property.countDocuments({ landlordId: objectId });

  // Total Booked Properties
  const bookedProperties = await Booking.distinct('propertyId', { landlordId: objectId });
  const totalBookedProperties = bookedProperties.length;

  // Total Tenants (unique tenants who chatted with the landlord)
  const tenantIds = await Chat.distinct('senderId', {
    receiverId: objectId,
    senderId: { $ne: objectId },
  });
  const totalTenants = tenantIds.length;

  // Booking Overview (monthly bookings for the past 12 months)
  const endDate = moment().endOf('month');
  const startDate = moment().subtract(11, 'months').startOf('month');
  const bookingOverview = await Booking.aggregate([
    {
      $match: {
        landlordId: objectId,
        bookingDate: { $gte: startDate.toDate(), $lte: endDate.toDate() },
      },
    },
    {
      $group: {
        _id: { $dateToString: { format: '%Y-%m', date: '$bookingDate' } },
        count: { $sum: 1 },
      },
    },
    {
      $sort: { '_id': 1 },
    },
  ]);

  const months = [];
  for (let m = moment(startDate); m.isSameOrBefore(endDate); m.add(1, 'month')) {
    months.push(m.format('YYYY-MM'));
  }
  const formattedBookingOverview = months.map(month => ({
    month,
    count: bookingOverview.find(b => b._id === month)?.count || 0,
  }));

  return {
    totalProperties,
    totalBookedProperties,
    totalTenants,
    bookingOverview: formattedBookingOverview,
  };
};

const getAdminDashboardData = async (): Promise<IAdminDashboard> => {
  // Total Users
  const totalUsers = await User.countDocuments();

  // Total Landlords
  const totalLandlords = await User.countDocuments({ role: 'landlord' });

  // Total Tenants
  const totalTenants = await User.countDocuments({ role: 'tenant' });

  // Total Listing Properties
  const totalListingProperties = await Property.countDocuments();

  // Total Earnings (from active, paid subscriptions)
  const subscriptions = await Subscription.find({ state: 'PAID', status: 'active' }).populate('package');
  const totalEarnings = subscriptions.reduce((sum, sub) => {
    return sum + (sub.package && 'price' in (sub.package as any) ? (sub.package as any).price : 0);
  }, 0);

  // Booking Overview (monthly bookings for the past 12 months)
  const endDate = moment().endOf('month');
  const startDate = moment().subtract(11, 'months').startOf('month');
  const bookingOverview = await Booking.aggregate([
    {
      $match: {
        bookingDate: { $gte: startDate.toDate(), $lte: endDate.toDate() },
      },
    },
    {
      $group: {
        _id: { $dateToString: { format: '%Y-%m', date: '$bookingDate' } },
        count: { $sum: 1 },
      },
    },
    {
      $sort: { '_id': 1 },
    },
  ]);

  const months = [];
  for (let m = moment(startDate); m.isSameOrBefore(endDate); m.add(1, 'month')) {
    months.push(m.format('YYYY-MM'));
  }
  const formattedBookingOverview = months.map(month => ({
    month,
    count: bookingOverview.find(b => b._id === month)?.count || 0,
  }));

  return {
    totalUsers,
    totalLandlords,
    totalTenants,
    totalListingProperties,
    totalEarnings,
    bookingOverview: formattedBookingOverview,
  };
};

const getEarningsReportData = async (): Promise<IEarningsReport> => {
  // Monthly Earnings
  const monthlyEarnings = await Subscription.aggregate([
    {
      $match: { state: 'PAID', status: 'active' },
    },
    {
      $lookup: {
        from: 'packages',
        localField: 'package',
        foreignField: '_id',
        as: 'package',
      },
    },
    {
      $unwind: '$package',
    },
    {
      $group: {
        _id: { $dateToString: { format: '%Y-%m', date: '$startDate' } },
        earnings: { $sum: '$package.price' },
      },
    },
    {
      $sort: { '_id': 1 },
    },
  ]);

  // Yearly Earnings
  const yearlyEarnings = await Subscription.aggregate([
    {
      $match: { state: 'PAID', status: 'active' },
    },
    {
      $lookup: {
        from: 'packages',
        localField: 'package',
        foreignField: '_id',
        as: 'package',
      },
    },
    {
      $unwind: '$package',
    },
    {
      $group: {
        _id: { $dateToString: { format: '%Y', date: '$startDate' } },
        earnings: { $sum: '$package.price' },
      },
    },
    {
      $sort: { '_id': 1 },
    },
  ]);

  // Overall Earnings
  const overallEarningsResult = await Subscription.aggregate([
    {
      $match: { state: 'PAID', status: 'active' },
    },
    {
      $lookup: {
        from: 'packages',
        localField: 'package',
        foreignField: '_id',
        as: 'package',
      },
    },
    {
      $unwind: '$package',
    },
    {
      $group: {
        _id: null,
        earnings: { $sum: '$package.price' },
      },
    },
  ]);

  const overallEarnings = overallEarningsResult[0]?.earnings || 0;

  return {
    monthly: monthlyEarnings.map(m => ({ month: m._id, earnings: m.earnings })),
    yearly: yearlyEarnings.map(y => ({ year: y._id, earnings: y.earnings })),
    overall: overallEarnings,
  };
};

const getLandlordDetailsService = async (landlordId: string) => {
  if (!Types.ObjectId.isValid(landlordId)) {
    throw new AppError(httpStatus.NOT_FOUND, 'Invalid landlord ID');
  }

  const landlord = await User.findById(landlordId)
    .select('-password -confirmPassword')
    .lean();

  if (!landlord) {
    throw new AppError(httpStatus.NOT_FOUND, 'Landlord not found');
  }


  const properties = await Property.find({ landlordId }).lean();
  const subscriptions = await Subscription.find({ landlord: landlordId })
    .populate('package')
    .populate('previousPackage')
    .lean();

  return {
    landlord,
    properties,
    subscriptions,
  };
};

export const DashboardService = {
  getLandlordDashboardData,
  getAdminDashboardData,
  getEarningsReportData,
  getLandlordDetailsService
};