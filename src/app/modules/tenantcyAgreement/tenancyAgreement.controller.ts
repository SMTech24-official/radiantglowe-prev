// tenancyAgreement.controller.ts
import { Request, Response } from 'express';
import catchAsync from '../../utils/catchAsync';
import { sendResponse } from '../../utils/sendResponse';
import { TenancyAgreementService } from './tenancyAgreement.service';
import AppError from '../../error/appError';
import httpStatus from 'http-status';
import { initiateTenancyAgreementValidationSchema, reviewTenancyAgreementValidationSchema, signTenancyAgreementValidationSchema, updateTenancyAgreementValidationSchema } from './tenancyAgreement.validation';

const initiateTenancyAgreement = catchAsync(async (req: Request, res: Response) => {
  const validatedData = (await initiateTenancyAgreementValidationSchema.parseAsync({ body: req.body })).body;
  const { propertyId, otherPartyId } = validatedData;
  const userId = req.user.userId;
  const role = req.user.role;

  const agreement = await TenancyAgreementService.initiateTenancyAgreement(propertyId, otherPartyId, userId, role);

  sendResponse(res, {
    status: 201,
    success: true,
    message: 'Tenancy agreement initiated successfully',
    data: agreement,
  });
});

const getTenancyAgreements = catchAsync(async (req: Request, res: Response) => {
  const { status, tenantId, landlordId, propertyId, page = '1', limit = '10' } = req.query;
  const filters = {
    status: status as string,
    tenantId: tenantId as string,
    landlordId: landlordId as string,
    propertyId: propertyId as string,
  };
  const pageNum = parseInt(page as string, 10);
  const limitNum = parseInt(limit as string, 10);

  const { agreements, total } = await TenancyAgreementService.getTenancyAgreements(filters, pageNum, limitNum);

  sendResponse(res, {
    status: 200,
    success: true,
    message: 'Tenancy agreements retrieved successfully',
    data: { agreements, total, page: pageNum, limit: limitNum },
  });
});

const getSingleTenancyAgreement = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const agreement = await TenancyAgreementService.getSingleTenancyAgreement(id);

  sendResponse(res, {
    status: 200,
    success: true,
    message: 'Tenancy agreement retrieved successfully',
    data: agreement,
  });
});

const getMyTenancyAgreements = catchAsync(async (req: Request, res: Response) => {
  const role = req.user.role;
  const userId = req.user.userId;
  const { status, otherId, propertyId, page = '1', limit = '10' } = req.query;
  const pageNum = parseInt(page as string, 10);
  const limitNum = parseInt(limit as string, 10);

  let filters: any;
  let agreementsData;

  if (role === 'landlord') {
    filters = {
      status: status as string,
      tenantId: otherId as string,
      landlordId: userId,
      propertyId: propertyId as string,
    };
    agreementsData = await TenancyAgreementService.getLandlordTenancyAgreements(filters, pageNum, limitNum);
  } else if (role === 'tenant') {
    filters = {
      status: status as string,
      landlordId: otherId as string,
      tenantId: userId,
      propertyId: propertyId as string,
    };
    agreementsData = await TenancyAgreementService.getTenantTenancyAgreements(filters, pageNum, limitNum);
  } else {
    throw new AppError(httpStatus.FORBIDDEN, 'Invalid role');
  }

  const { agreements, total } = agreementsData;

  sendResponse(res, {
    status: 200,
    success: true,
    message: `${role.charAt(0).toUpperCase() + role.slice(1)} tenancy agreements retrieved successfully`,
    data: { agreements, total, page: pageNum, limit: limitNum },
  });
});

const updateTenancyAgreement = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const validatedData = (await updateTenancyAgreementValidationSchema.parseAsync({ body: req.body })).body;

  const updatedAgreement = await TenancyAgreementService.updateTenancyAgreement(id, validatedData);

  sendResponse(res, {
    status: 200,
    success: true,
    message: 'Tenancy agreement updated successfully',
    data: updatedAgreement,
  });
});

const reviewTenancyAgreement = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const { action, reason } = (await reviewTenancyAgreementValidationSchema.parseAsync({ body: req.body })).body;
  const userId = req.user.userId;
  const role = req.user.role;

  let result;
  if (action === 'accept') {
    result = await TenancyAgreementService.acceptTenancyAgreement(id, userId, role);
  } else if (action === 'reject') {
    if (!reason) {
      throw new AppError(httpStatus.BAD_REQUEST, 'Reason is required for rejection');
    }
    result = await TenancyAgreementService.rejectTenancyAgreement(id, userId, role, reason);
  } else {
    throw new AppError(httpStatus.BAD_REQUEST, 'Invalid action');
  }

  sendResponse(res, {
    status: 200,
    success: true,
    message: `Tenancy agreement ${action}ed successfully`,
    data: result,
  });
});

const signTenancyAgreement = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const userId = req.user.userId;
  const role = req.user.role;
  const { signature } = signTenancyAgreementValidationSchema.parse({ body: req.body }).body;

  const signedAgreement = await TenancyAgreementService.signTenancyAgreement(id, userId, role, signature);

  sendResponse(res, {
    status: 200,
    success: true,
    message: 'Tenancy agreement signed successfully',
    data: signedAgreement,
  });
});

const deleteTenancyAgreement = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const userId = req.user.userId;
  const userRole = req.user.role;

  const deletedAgreement = await TenancyAgreementService.deleteTenancyAgreement(id, userId, userRole);

  sendResponse(res, {
    status: 200,
    success: true,
    message: 'Tenancy agreement deleted successfully',
    data: deletedAgreement,
  });
});

export const TenancyAgreementController = {
  initiateTenancyAgreement,
  getTenancyAgreements,
  getSingleTenancyAgreement,
  getMyTenancyAgreements,
  updateTenancyAgreement,
  reviewTenancyAgreement,
  signTenancyAgreement,
  deleteTenancyAgreement,
};