// tenancyAgreement.service.ts
import httpStatus from 'http-status';
import mongoose, { Types } from 'mongoose';
import AppError from '../../error/appError';
import { Property } from '../property/property.model';
import { ITenancyAgreement } from './tenancyAgreement.interface';
import { TenancyAgreement } from './tenancyAgreement.model';
import { sendAdminEmail, sendEmail } from '../../utils/sendEmail';
import { User } from '../user/user.model';
import { emailVariable } from '../../utils/constantValue';
import config from '../../config';

const initiateTenancyAgreement = async (
  propertyId: string,
  otherPartyId: string,
  userId: string,
  role: string
): Promise<ITenancyAgreement> => {
  let landlordId: string;
  let tenantId: string;

  if (role === 'landlord') {
    landlordId = userId;
    tenantId = otherPartyId;
  } else if (role === 'tenant') {
    tenantId = userId;
    landlordId = otherPartyId;
  } else {
    throw new AppError(httpStatus.FORBIDDEN, 'Only landlord or tenant can initiate tenancy agreement');
  }

  const existingAgreement = await TenancyAgreement.findOne({ tenantId, propertyId,landlordId });
  if (existingAgreement) {
    throw new AppError(httpStatus.BAD_REQUEST, 'Tenancy agreement already exists');
  }

  const userProfile = await User.findById(userId).select('email name');
  const otherUserProfile = await User.findById(otherPartyId).select('email name');

  const property = await Property.findById(propertyId);
  if (!property) {
    throw new AppError(httpStatus.NOT_FOUND, 'Property not found');
  }

  const agreementData: Partial<ITenancyAgreement> = {
    propertyId,
    landlordId,
    tenantId,
    status: 'draft',
    agreementDate: new Date(),
  };

  if (role === 'landlord') {
    agreementData.isActiveLandlord = true;
  } else if (role === 'tenant') {
    agreementData.isActiveTenant = true;
  }

  const agreement = await TenancyAgreement.create(agreementData);


await sendEmail(
  userProfile?.email || '',
  'Tenancy Agreement Initiated',
  `
    <div style="font-family: Arial, sans-serif; line-height: 1.6; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 8px;">
      ${emailVariable.headerLogo}
      <h2 style="color: #333; text-align: center;">Tenancy Agreement Initiated</h2>
      <p style="color: #555;">Dear ${userProfile?.name || ''},</p>
      <p>A tenancy agreement has been initiated for the property <strong>${property.headlineYourProperty}</strong>.</p>
      <p>Your agreement status is currently set as <strong>Draft</strong>. Please review and confirm the agreement at your earliest convenience.</p>
      
      <ul style="color: #555;">
        <li><strong>Property:</strong> ${property.headlineYourProperty}</li>
        <li><strong>Status:</strong> Draft</li>
      </ul>

      <p style="color: #555;">If you have any questions, please contact our support team at <a href="mailto:${config.SUPPORT_EMAIL}" style="color: #007BFF;">${config.SUPPORT_EMAIL}</a>.</p>
      <p style="color: #555;">Best regards,<br>${emailVariable.regards}</p>
      <hr style="border-top: 1px solid #e0e0e0; margin: 20px 0;">
      ${emailVariable.footer}
    </div>
  `
);

await sendAdminEmail(
  '',
  'New Tenancy Agreement Initiated',
  `
    <div style="font-family: Arial, sans-serif; line-height: 1.6; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 8px;">
      ${emailVariable.headerLogo}
      <h2 style="color: #333; text-align: center;">New Tenancy Agreement Initiated</h2>
      <p style="color: #555;">Hello Admin,</p>
      <p>A new tenancy agreement has been initiated:</p>
      
      <ul style="color: #555;">
        <li><strong>Property:</strong> ${property.headlineYourProperty}</li>
        <li><strong>Landlord:</strong> ${userProfile?.name} (${userProfile?.email})</li>
        <li><strong>Tenant:</strong> ${otherUserProfile?.name} (${otherUserProfile?.email})</li>
        <li><strong>Status:</strong> Draft</li>
      </ul>

      <p style="color: #555;">Please monitor and ensure both parties confirm the agreement.</p>
      <p style="color: #555;">Regards,<br>${emailVariable.regards}</p>
      <hr style="border-top: 1px solid #e0e0e0; margin: 20px 0;">
      ${emailVariable.footer}
    </div>
  `
);



  return agreement;
};

const getTenancyAgreements = async (
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
  const agreements = await TenancyAgreement.find(query)
    .sort({ createdAt: -1 })
    .populate('tenantId', '-password -confirmPassword')
    .populate('landlordId', '-password -confirmPassword')
    .populate('propertyId')
    .skip(skip)
    .limit(limit);
  const total = await TenancyAgreement.countDocuments(query);

  return { agreements, total };
};

const getLandlordTenancyAgreements = async (
  filters: { status?: string; tenantId?: string; landlordId: string; propertyId?: string },
  page: number,
  limit: number
) => {
  const query: any = { 
    landlordId: new Types.ObjectId(filters.landlordId),
    status: { $ne: 'draft' }
   };
  if (filters.status) query.status = filters.status;
  if (filters.tenantId) query.tenantId = new Types.ObjectId(filters.tenantId);
  if (filters.propertyId) query.propertyId = new Types.ObjectId(filters.propertyId);

  const skip = (page - 1) * limit;

  const agreements = await TenancyAgreement.aggregate([
    {
      $match: query,
    },
    {
      $group: {
        _id: '$tenantId',
        agreement: { $first: '$$ROOT' },
      },
    },
    {
      $replaceRoot: { newRoot: '$agreement' },
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

  const total = (await TenancyAgreement.aggregate([
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

  return { agreements, total };
};

const getTenantTenancyAgreements = async (
  filters: { status?: string; landlordId?: string; tenantId: string; propertyId?: string },
  page: number,
  limit: number
) => {
  const query: any = {
     tenantId: new Types.ObjectId(filters.tenantId),
     status: { $ne: 'draft' }
    };
  if (filters.status) query.status = filters.status;
  if (filters.landlordId) query.landlordId = new Types.ObjectId(filters.landlordId);
  if (filters.propertyId) query.propertyId = new Types.ObjectId(filters.propertyId);

  const skip = (page - 1) * limit;

  const agreements = await TenancyAgreement.aggregate([
    {
      $match: query,
    },
    {
      $group: {
        _id: '$landlordId',
        agreement: { $first: '$$ROOT' },
      },
    },
    {
      $replaceRoot: { newRoot: '$agreement' },
    },
    {
      $lookup: {
        from: 'users',
        localField: 'landlordId',
        foreignField: '_id',
        as: 'landlordId',
      },
    },
    {
      $unwind: '$landlordId',
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
        'landlordId.password': 0,
        'landlordId.confirmPassword': 0,
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

  const total = (await TenancyAgreement.aggregate([
    {
      $match: query,
    },
    {
      $group: {
        _id: '$landlordId',
      },
    },
    {
      $count: 'total',
    },
  ]))[0]?.total || 0;

  return { agreements, total };
};

const getSingleTenancyAgreement = async (id: string): Promise<ITenancyAgreement | null> => {
  const agreement = await TenancyAgreement.findById(id)
    .populate('tenantId', '-password -confirmPassword')
    .populate('landlordId', '-password -confirmPassword')
    .populate('propertyId');
  if (!agreement) {
    throw new AppError(httpStatus.NOT_FOUND, 'Tenancy agreement not found');
  }
  return agreement;
};

const updateTenancyAgreement = async (id: string, data: Partial<ITenancyAgreement>): Promise<ITenancyAgreement | null> => {
  const agreement = await TenancyAgreement.findById(id);
  if (!agreement) {
    throw new AppError(httpStatus.NOT_FOUND, 'Tenancy agreement not found');
  }
  if (agreement.status === 'complete') {
    throw new AppError(httpStatus.FORBIDDEN, 'Cannot update completed agreement');
  }

  // Only allow updating specific fields
  const updatableFields = [
    'tenancyPeriod',
    'renewalNoticeDays',
    'terminationNoticeWeeks',
    'arbitrationState',
    'governingLawState',
    'startDate',
    'endDate',
    'witnessSignature',
    'status', // Allow admin to set to 'enable' or 'draft'
    'rejectionReason', // Allow clearing or updating
  ];

  updatableFields.forEach(field => {
    if (data[field as keyof ITenancyAgreement] !== undefined) {
      (agreement as any)[field] = data[field as keyof ITenancyAgreement];
    }
  });

  if (data.status && !['draft', 'enable'].includes(data.status)) {
    throw new AppError(httpStatus.BAD_REQUEST, 'Admin can only set status to draft or enable');
  }

  await agreement.save();

  const populatedAgreement = await TenancyAgreement.findById(id)
    .populate('tenantId', 'name email')
    .populate('landlordId', 'name email')
    .populate('propertyId', 'headlineYourProperty location');

  return populatedAgreement;
};

const acceptTenancyAgreement = async (id: string, userId: string, role: string): Promise<ITenancyAgreement | null> => {
  const agreement = await TenancyAgreement.findById(id);
  if (!agreement) {
    throw new AppError(httpStatus.NOT_FOUND, 'Tenancy agreement not found');
  }
  if (agreement.status !== 'enable') {
    throw new AppError(httpStatus.FORBIDDEN, 'Can only accept enabled agreements');
  }

  const isLandlord = role === 'landlord'
  const isTenant = role === 'tenant'

  if (!isLandlord && !isTenant) {
    throw new AppError(httpStatus.FORBIDDEN, 'You are not authorized to accept this agreement');
  }

  if (isLandlord) {
    agreement.isActiveLandlord = true;
  } else if (isTenant) {
    agreement.isActiveTenant = true;
  }

  await agreement.save();

  return agreement;
};

const rejectTenancyAgreement = async (id: string, userId: string, role: string, reason: string): Promise<ITenancyAgreement | null> => {
  const agreement = await TenancyAgreement.findById(id);
  if (!agreement) {
    throw new AppError(httpStatus.NOT_FOUND, 'Tenancy agreement not found');
  }
  if (agreement.status !== 'enable') {
    throw new AppError(httpStatus.FORBIDDEN, 'Can only reject enabled agreements');
  }

  const isLandlord = role === 'landlord'
  const isTenant = role === 'tenant'

  if (!isLandlord && !isTenant) {
    throw new AppError(httpStatus.FORBIDDEN, 'You are not authorized to reject this agreement');
  }

  agreement.status = 'draft';
  agreement.rejectionReason = reason;

  // Optionally reset signatures or isActive if needed, but per requirements, keep isActive as is for admin to see
  await agreement.save();

  return agreement;
};

const signTenancyAgreement = async (id: string, userId: string, role: string, signature: string): Promise<ITenancyAgreement | null> => {
  const agreement = await TenancyAgreement.findById(id);
  if (!agreement) {
    throw new AppError(httpStatus.NOT_FOUND, 'Tenancy agreement not found');
  }
  if (agreement.status !== 'enable') {
    throw new AppError(httpStatus.FORBIDDEN, 'Can only sign enabled agreements');
  }
//   if (!agreement.isActiveLandlord || !agreement.isActiveTenant) {
//     throw new AppError(httpStatus.FORBIDDEN, 'Both parties must accept the agreement before signing');
//   }

  const isLandlord = role === 'landlord' && agreement.landlordId.toString() === userId;
  const isTenant = role === 'tenant' && agreement.tenantId.toString() === userId;

  if (!isLandlord && !isTenant) {
    throw new AppError(httpStatus.FORBIDDEN, 'You are not authorized to sign this agreement');
  }

  if (isLandlord) {
    agreement.landlordSignature = signature;
  } else if (isTenant) {
    agreement.tenantSignature = signature;
  }

  // Check if both signed and both active, set to complete
  if (agreement.landlordSignature && agreement.tenantSignature && agreement.isActiveLandlord && agreement.isActiveTenant) {
    agreement.status = 'complete';
  }

  await agreement.save();

  return agreement;
};

const deleteTenancyAgreement = async (id: string, userId: string, userRole: string): Promise<ITenancyAgreement | null> => {
  const agreement = await TenancyAgreement.findById(id);
  if (!agreement) {
    throw new AppError(httpStatus.NOT_FOUND, 'Tenancy agreement not found');
  }
  if (userRole !== 'admin' && agreement.landlordId.toString() !== userId) {
    throw new AppError(httpStatus.FORBIDDEN, 'Only the landlord or admin can delete this agreement');
  }

  return await TenancyAgreement.findByIdAndDelete(id);
};

export const TenancyAgreementService = {
  initiateTenancyAgreement,
  getTenancyAgreements,
  getLandlordTenancyAgreements,
  getTenantTenancyAgreements,
  getSingleTenancyAgreement,
  updateTenancyAgreement,
  acceptTenancyAgreement,
  rejectTenancyAgreement,
  signTenancyAgreement,
  deleteTenancyAgreement,
};