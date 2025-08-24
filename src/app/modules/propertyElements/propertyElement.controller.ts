import { Request, Response } from 'express';
import catchAsync from '../../utils/catchAsync';
import { sendResponse } from '../../utils/sendResponse';
import { PropertyTypesService } from './propertyElement.service';

const createPropertyTypes = catchAsync(async (req: Request, res: Response) => {
  const propertyTypesData = req.body;
  const result = await PropertyTypesService.createPropertyTypes(propertyTypesData);
  sendResponse(res, {
    status: 200,
    success: true,
    message: 'Property types created successfully',
    data: result,
  });
});

const getPropertyTypes = catchAsync(async (req: Request, res: Response) => {
  const result = await PropertyTypesService.getPropertyTypes();
  sendResponse(res, {
    status: 200,
    success: true,
    message: 'Property types retrieved successfully',
    data: result,
  });
});

const updatePropertyTypes = catchAsync(async (req: Request, res: Response) => {
  const updatedData = req.body;
  const result = await PropertyTypesService.updatePropertyTypes(updatedData);
  sendResponse(res, {
    status: 200,
    success: true,
    message: 'Property types updated successfully',
    data: result,
  });
});

const deletePropertyType = catchAsync(async (req: Request, res: Response) => {
  const { type, value } = req.params;
  const result = await PropertyTypesService.deletePropertyType(type, value);
  sendResponse(res, {
    status: 200,
    success: true,
    message: 'Property type deleted successfully',
    data: result,
  });
});

export const PropertyTypesController = {
  createPropertyTypes,
  getPropertyTypes,
  updatePropertyTypes,
  deletePropertyType,
};