import { Request, Response } from 'express';
import catchAsync from '../../utils/catchAsync';
import { sendResponse } from '../../utils/sendResponse';
import { permissionValidationSchema, updatePermissionStatusValidationSchema } from './permission.validation';
import { PermissionService } from './permission.services';
import AppError from '../../error/appError';
import httpStatus from 'http-status';

const createPermission = catchAsync(async (req: Request, res: Response) => {
  const validatedData = (await permissionValidationSchema.parseAsync({ body: req.body })).body;
  const tenantId = validatedData.tenantId;
  const landlordId = validatedData.landlordId;
  const propertyId = validatedData.propertyId;

  const permission = await PermissionService.createPermission(tenantId, landlordId, propertyId);

  sendResponse(res, {
    status: 201,
    success: true,
    message: 'Permission request created successfully',
    data: permission,
  });
});

const getPermissions = catchAsync(async (req: Request, res: Response) => {
  const { status, tenantId, landlordId, propertyId, page = '1', limit = '10' } = req.query;
  const filters = {
    status: status as string,
    tenantId: tenantId as string,
    landlordId: landlordId as string,
    propertyId: propertyId as string,
  };
  const pageNum = parseInt(page as string, 10);
  const limitNum = parseInt(limit as string, 10);

  const { permissions, total } = await PermissionService.getPermissions(filters, pageNum, limitNum);

  sendResponse(res, {
    status: 200,
    success: true,
    message: 'Permissions retrieved successfully',
    data: { permissions, total, page: pageNum, limit: limitNum },
  });
});

const getSinglePermission = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const permission = await PermissionService.getSinglePermission(id);

  sendResponse(res, {
    status: 200,
    success: true,
    message: 'Permission retrieved successfully',
    data: permission,
  });
});

const gettenantPermission = catchAsync(async (req: Request, res: Response) => {
  const { tenantId, propertyId  } = req.query;
  const tenantIdStr = typeof tenantId === 'string' ? tenantId : undefined;
  const propertyIdStr = typeof propertyId === 'string' ? propertyId : undefined;
  const permission = await PermissionService.getTenantPermission(tenantIdStr, propertyIdStr);

  sendResponse(res, {
    status: 200,
    success: true,
    message: 'Permission retrieved successfully',
    data: permission,
  });
});

const getLandlordPermissionRequests = catchAsync(async (req: Request, res: Response) => {
  const { status, tenantId, propertyId, page = '1', limit = '10' } = req.query;
  const landlordId = req.user.userId;
  const filters = {
    status: status as string,
    tenantId: tenantId as string,
    landlordId,
    propertyId: propertyId as string,
  };
  const pageNum = parseInt(page as string, 10);
  const limitNum = parseInt(limit as string, 10);

  const { permissions, total } = await PermissionService.getLandlordPermissionRequests(filters, pageNum, limitNum);

  sendResponse(res, {
    status: 200,
    success: true,
    message: 'Landlord permission requests retrieved successfully',
    data: { permissions, total, page: pageNum, limit: limitNum },
  });
});

const updatePermissionStatus = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const landlordId = req.user.userId;
  const { status } = updatePermissionStatusValidationSchema.parse({ body: req.body }).body;

  const updatedPermission = await PermissionService.updatePermissionStatus(id, status, landlordId);

  sendResponse(res, {
    status: 200,
    success: true,
    message: `Permission ${status} successfully`,
    data: updatedPermission,
  });
});

const deletePermission = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const userId = req.user.userId;
  const userRole = req.user.role;

  const deletedPermission = await PermissionService.deletePermission(id, userId, userRole);

  sendResponse(res, {
    status: 200,
    success: true,
    message: 'Permission deleted successfully',
    data: deletedPermission,
  });
});

export const PermissionController = {
  createPermission,
  getPermissions,
  getSinglePermission,
  gettenantPermission,
  getLandlordPermissionRequests,
  updatePermissionStatus,
  deletePermission,
};