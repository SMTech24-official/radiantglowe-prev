import { Request, Response } from 'express';
import catchAsync from '../../utils/catchAsync';
import { sendResponse } from '../../utils/sendResponse';
import { propertyValidationSchema, updatePropertyValidationSchema, updatePropertyStatusValidationSchema, acceptRejectPropertyValidationSchema } from './property.validation';
import { PropertyService } from './property.services';
import AppError from '../../error/appError';
import httpStatus from 'http-status';

const createProperty = catchAsync(async (req: Request, res: Response) => {
  const validatedData = (await propertyValidationSchema.parseAsync({ body: req.body })).body;

  let landlordId;
  if(req.user.role === 'admin') {
    landlordId = validatedData?.landlordId;
  } else {
    landlordId = req.user.userId;
  }
  // const landlordId = req.user.userId;
  const property = await PropertyService.createProperty(landlordId, validatedData as any);

  sendResponse(res, {
    status: 201,
    success: true,
    message: 'Property created successfully',
    data: property,
  });
});

const getProperties = catchAsync(async (req: Request, res: Response) => {
  const { status, where, minPrice, maxPrice, propertyType, availability,searchTerm, page = '1', limit = '10' } = req.query;
  const filters = {
    status: status as string,
    where: where as string,
    minPrice: minPrice ? parseFloat(minPrice as string) : undefined,
    maxPrice: maxPrice ? parseFloat(maxPrice as string) : undefined,
    propertyType: propertyType as string,
    availability: availability as string,
    searchTerm: searchTerm as string,
  };
  const pageNum = parseInt(page as string, 10);
  const limitNum = parseInt(limit as string, 10);
  const { properties, total } = await PropertyService.getProperties(filters, pageNum, limitNum);
  sendResponse(res, {
    status: 200,
    success: true,
    message: 'Properties retrieved successfully',
    data: { properties, total, page: pageNum, limit: limitNum },
  });
});

const getActiveProperties = catchAsync(async (req: Request, res: Response) => {
  const { status, where, minPrice, maxPrice, propertyType, availability,searchTerm, page = '1', limit = '10' } = req.query;
  const filters = {
    status: status as string,
    where: where as string,
    minPrice: minPrice ? parseFloat(minPrice as string) : undefined,
    maxPrice: maxPrice ? parseFloat(maxPrice as string) : undefined,
    propertyType: propertyType as string,
    availability: availability as string,
    searchTerm: searchTerm as string,
  };
  const pageNum = parseInt(page as string, 10);
  const limitNum = parseInt(limit as string, 10);
  const { properties, total, minPriceRange, maxPriceRange } = await PropertyService.getActiveProperties(filters, pageNum, limitNum);
  sendResponse(res, {
    status: 200,
    success: true,
    message: 'Active properties retrieved successfully',
    data: { properties, total, page: pageNum, limit: limitNum, minPriceRange, maxPriceRange },
  });
});

const getLandlordProperties = catchAsync(async (req: Request, res: Response) => {
  const { status, where, minPrice, maxPrice, propertyType, availability, searchTerm, page = '1', limit = '10' } = req.query;
  const filters = {
    status: status as string,
    where: where as string,
    minPrice: minPrice ? parseFloat(minPrice as string) : undefined,
    maxPrice: maxPrice ? parseFloat(maxPrice as string) : undefined,
    propertyType: propertyType as string,
    availability: availability as string,
    searchTerm: searchTerm as string, // Added searchTerm to filters
  };
  const pageNum = parseInt(page as string, 10);
  const limitNum = parseInt(limit as string, 10);
  const landlordId = req.user.userId;
  const { properties, total } = await PropertyService.getLandlordProperties(landlordId, filters, pageNum, limitNum);
  sendResponse(res, {
    status: 200,
    success: true,
    message: 'Landlord properties retrieved successfully',
    data: { properties, total, page: pageNum, limit: limitNum },
  });
});

const getSingleProperty = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const property = await PropertyService.getSingleProperty(id);
  sendResponse(res, {
    status: 200,
    success: true,
    message: 'Property retrieved successfully',
    data: property,
  });
});

const getPropertyWithReviews = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const property = await PropertyService.getPropertyWithReviews(id);
  sendResponse(res, {
    status: 200,
    success: true,
    message: 'Property with reviews retrieved successfully',
    data: property,
  });
});

const updateProperty = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const userId = req.user.userId;
  const userRole = req.user.role;
  const validatedData = (await propertyValidationSchema.parseAsync({ body: req.body })).body;
  const updatedProperty = await PropertyService.updateProperty(id, userId, userRole, validatedData as any);
  sendResponse(res, {
    status: 200,
    success: true,
    message: 'Property updated successfully',
    data: updatedProperty,
  });
});

const updatePropertyStatus = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const { status } = updatePropertyStatusValidationSchema.parse({ body: req.body }).body;
  const updatedProperty = await PropertyService.updatePropertyStatus(id, status);
  sendResponse(res, {
    status: 200,
    success: true,
    message: 'Property status updated successfully',
    data: updatedProperty,
  });
});

const acceptOrRejectProperty = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const validatedData = acceptRejectPropertyValidationSchema.parse({ body: req.body }).body;

  const { isActive } = validatedData;

  if (typeof isActive !== 'boolean') {
    throw new AppError(httpStatus.BAD_REQUEST, '`isActive` must be a boolean');
  }

  const result = await PropertyService.acceptOrRejectProperty(id, isActive);

  sendResponse(res, {
    status: 200,
    success: true,
    message: isActive
      ? 'Property accepted successfully'
      : 'Property rejected successfully',
    data: result,
  });
});


const rejectProperty = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const validatedData = acceptRejectPropertyValidationSchema.parse({ body: req.body }).body;
  if (validatedData.isActive) {
    throw new AppError(httpStatus.BAD_REQUEST, 'isActive must be false for rejection');
  }
  const updatedProperty = await PropertyService.rejectProperty(id);
  sendResponse(res, {
    status: 200,
    success: true,
    message: 'Property rejected successfully',
    data: updatedProperty,
  });
});

const deleteProperty = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const userId = req.user.userId;
  const userRole = req.user.role;
  const deletedProperty = await PropertyService.deleteProperty(id, userId, userRole);
  sendResponse(res, {
    status: 200,
    success: true,
    message: 'Property deleted successfully',
    data: deletedProperty,
  });
});

const updateHomePageView = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const updatedProperty = await PropertyService.updateHomePageViewStatus(id);
  sendResponse(res, {
    status: 200,
    success: true,
    message: 'Property home page view status updated successfully',
    data: updatedProperty,
  });
});

export const PropertyController = {
  createProperty,
  getProperties,
  getActiveProperties,
  getLandlordProperties,
  getSingleProperty,
  getPropertyWithReviews,
  updateProperty,
  updatePropertyStatus,
  acceptOrRejectProperty,
  rejectProperty,
  deleteProperty,
  updateHomePageView
};