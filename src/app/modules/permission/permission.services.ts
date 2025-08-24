import httpStatus from 'http-status';
import mongoose, { Types } from 'mongoose';
import AppError from '../../error/appError';
import { Property } from '../property/property.model';
import { IPermission } from './permission.interface';
import { Permission } from './permission.model';
import { sendAdminEmail, sendEmail } from '../../utils/sendEmail';
import { emailVariable } from '../../utils/constantValue';
import { User } from '../user/user.model';

const createPermission = async (tenantId: string, landlordId: string, propertyId: string): Promise<IPermission> => {
  // Check if a permission request already exists for this tenant and property
  const existingPermission = await Permission.findOne({ tenantId, propertyId });
  if (existingPermission) {
    throw new AppError(httpStatus.BAD_REQUEST, 'A permission request for this property by this tenant already exists');
  }

  const tenantUser = await User.findById(tenantId);
  const landlordUser = await User.findById(landlordId);

  const property = await Property.findById(propertyId);
  if (!property) {
    throw new AppError(httpStatus.NOT_FOUND, 'Property not found');
  }
  //   if (property.landlordId.toString() !== landlordId) {
  //     throw new AppError(httpStatus.FORBIDDEN, 'Landlord ID does not match property owner');
  //   }
  //   if (!property.isActive) {
  //     throw new AppError(httpStatus.BAD_REQUEST, 'Property is not active');
  //   }

  const permission = await Permission.create({
    tenantId,
    landlordId,
    propertyId,
    status: 'pending',
    requestDate: new Date(),
  });

  await sendEmail(
  tenantUser?.email || "user@example.com",
  "Permission Request Submitted",
  `
    <div style="font-family: Arial, sans-serif; line-height: 1.6;">
      ${emailVariable.headerLogo}
      <p>Dear ${tenantUser?.name || "User"},</p>
      <p>Your permission request for the property <strong>${property.headlineYourProperty}</strong> has been <strong>submitted successfully</strong> and is pending approval.</p>
      
      <p>We will notify you once the landlord responds.</p>
      ${emailVariable.footer}
    </div>
  `
);

await sendEmail(
    landlordUser?.email || "user@example.com",
  "New Permission Request Received",
  `
    <div style="font-family: Arial, sans-serif; line-height: 1.6;">
      ${emailVariable.headerLogo}
      <p>Dear ${landlordUser?.name || "Landlord"},</p>
      <p>You have received a new permission request for your property <strong>${property.headlineYourProperty }</strong> from <strong>${tenantUser?.name}</strong>.</p>

      <h3>Request Details:</h3>
      <ul>
        <li><strong>Tenant Name:</strong> ${tenantUser?.name}</li>
        <li><strong>Tenant Email:</strong> ${tenantUser?.email}</li>
      </ul>

      <p>Please review and approve or reject the request as soon as possible.</p>
      ${emailVariable.footer}
    </div>
  `
);

await sendAdminEmail(
  '',
  "New Permission Request Notification",
  `
    <div style="font-family: Arial, sans-serif; line-height: 1.6;">
      ${emailVariable.headerLogo}
      <p>Hello Admin,</p>
      <p>A new permission request has been submitted:</p>

      <h3>Details:</h3>
      <ul>
        <li><strong>Tenant:</strong> ${tenantUser?.name} (${tenantUser?.email})</li>
        <li><strong>Property:</strong> ${property.headlineYourProperty}</li>
        <li><strong>Landlord:</strong> ${landlordUser?.name} (${landlordUser?.email})</li>
      </ul>

      <p>Please monitor the request and take any necessary action.</p>
      ${emailVariable.footer}
    </div>
  `
);


  return permission;
};

const getPermissions = async (
  filters: { status?: string; tenantId?: string; landlordId?: string; propertyId?: string },
  page: number,
  limit: number
) => {
  const query: any = {};
  if (filters.status) query.status = filters.status;
  if (filters.tenantId) query.tenantId = filters.tenantId;
  if (filters.landlordId) query.landlordId = filters.landlordId;
  if (filters.propertyId) query.propertyId = filters.propertyId;

  const skip = (page - 1) * limit;
  const permissions = await Permission.find(query)
    .sort({ createdAt: -1 })
    .populate('tenantId', 'name email')
    .populate('landlordId', 'name email')
    .populate('propertyId', 'headlineYourProperty location')
    .skip(skip)
    .limit(limit);
  const total = await Permission.countDocuments(query);

  return { permissions, total };
};

const getLandlordPermissionRequests = async (
  filters: { status?: string; tenantId?: string; landlordId: string; propertyId?: string },
  page: number,
  limit: number
) => {
  const query: any = { landlordId: new Types.ObjectId(filters.landlordId) };
  if (filters.status) query.status = filters.status;
  if (filters.tenantId) query.tenantId = new Types.ObjectId(filters.tenantId);
  if (filters.propertyId) query.propertyId = new Types.ObjectId(filters.propertyId);

  const skip = (page - 1) * limit;

  const permissions = await Permission.aggregate([
    {
      $match: query,
    },
    {
      $group: {
        _id: '$tenantId',
        permission: { $first: '$$ROOT' },
      },
    },
    {
      $replaceRoot: { newRoot: '$permission' },
    },
    {
      $lookup: {
        from: 'users',
        localField: 'tenantId',
        foreignField: '_id',
        as: 'tenantId',
      },
    },
    {
      $unwind: '$tenantId',
    },
    {
      $lookup: {
        from: 'properties',
        localField: 'propertyId',
        foreignField: '_id',
        as: 'propertyId',
      },
    },
    {
      $unwind: '$propertyId',
    },
    {
      $project: {
        'tenantId.password': 0,
        'tenantId.confirmPassword': 0,
      },
    },
    {
      $sort: { createdAt: -1 },
    },
    {
      $skip: skip,
    },
    {
      $limit: limit,
    },
  ]);

  const total = (await Permission.aggregate([
    {
      $match: query,
    },
    {
      $group: {
        _id: '$tenantId',
      },
    },
    {
      $count: 'total',
    },
  ]))[0]?.total || 0;

  return { permissions, total };
};

const getSinglePermission = async (id: string): Promise<IPermission | null> => {
  const permission = await Permission.findById(id)
    .populate('tenantId', 'name email')
    .populate('landlordId', 'name email')
    .populate('propertyId', 'headlineYourProperty location');
  if (!permission) {
    throw new AppError(httpStatus.NOT_FOUND, 'Permission not found');
  }
  return permission;
};
const getTenantPermission = async (tenantId?: string, propertyId?: string): Promise<IPermission | null> => {
  const permission = await Permission.findOne({ tenantId, propertyId })
  if (!permission) {
    throw new AppError(httpStatus.NOT_FOUND, 'Permission not found');
  }
  return permission;
};

const updatePermissionStatus = async (id: string, status: 'granted' | 'denied', landlordId: string): Promise<IPermission | null> => {
  const permission = await Permission.findById(id);
  if (!permission) {
    throw new AppError(httpStatus.NOT_FOUND, 'Permission not found');
  }
  if (permission.landlordId.toString() !== landlordId) {
    throw new AppError(httpStatus.FORBIDDEN, 'Only the landlord can update this permission');
  }

  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    permission.status = status;
    permission.responseDate = new Date();
    const property = await Property.findById(permission.propertyId).session(session);
    if (!property) {
      throw new AppError(httpStatus.NOT_FOUND, 'Property not found');
    }
    if (status === 'granted') {
      property.status = 'pending';
    } else if (status === 'denied') {
      property.status = 'available';
    }
    await property.save({ session });
    await permission.save({ session });
    await session.commitTransaction();
  } catch (error) {
    await session.abortTransaction();
    throw error;
  } finally {
    session.endSession();
  }

  const populatedPermission = await Permission.findById(id)
    .populate('tenantId', 'name email')
    .populate('landlordId', 'name email')
    .populate('propertyId', 'headlineYourProperty location');

  return populatedPermission;
};

const deletePermission = async (id: string, userId: string, userRole: string): Promise<IPermission | null> => {
  const permission = await Permission.findById(id);
  if (!permission) {
    throw new AppError(httpStatus.NOT_FOUND, 'Permission not found');
  }
  if (userRole !== 'admin' && permission.landlordId.toString() !== userId) {
    throw new AppError(httpStatus.FORBIDDEN, 'Only the landlord or admin can delete this permission');
  }

  return await Permission.findByIdAndDelete(id);
};

export const PermissionService = {
  createPermission,
  getPermissions,
  getLandlordPermissionRequests,
  getSinglePermission,
  getTenantPermission,
  updatePermissionStatus,
  deletePermission,
};