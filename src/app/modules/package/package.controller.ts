import { Request, Response, NextFunction } from 'express';
import { PackageService } from './package.service';
import { packageValidationSchema, updatePackageValidationSchema, updatePackageStatusValidationSchema } from './package.validation';
import AppError from '../../error/appError';
import httpStatus from 'http-status';

const createPackage = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const validatedData = packageValidationSchema.parse({ body: req.body }).body;
    const newPackage = await PackageService.createPackage(validatedData);
    res.status(httpStatus.CREATED).json({
      success: true,
      data: newPackage,
      message: 'Package created successfully',
    });
  } catch (error) {
    next(error);
  }
};

const getPackages = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const packages = await PackageService.getPackages();
    res.status(httpStatus.OK).json({
      success: true,
      data: packages,
      message: 'Packages retrieved successfully',
    });
  } catch (error) {
    next(error);
  }
};

const getSinglePackage = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const packageDoc = await PackageService.getSinglePackage(id);
    res.status(httpStatus.OK).json({
      success: true,
      data: packageDoc,
      message: 'Package retrieved successfully',
    });
  } catch (error) {
    next(error);
  }
};

// get active packages

const getActivePackages = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const packages = await PackageService.getActivePackages();
    res.status(httpStatus.OK).json({
      success: true,
      data: packages,
      message: 'Packages retrieved successfully',
    });
  } catch (error) {
    next(error);
  }
};

const updatePackage = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const validatedData = updatePackageValidationSchema.parse({ body: req.body }).body;
    const updatedPackage = await PackageService.updatePackage(id, validatedData);
    res.status(httpStatus.OK).json({
      success: true,
      data: updatedPackage,
      message: 'Package updated successfully',
    });
  } catch (error) {
    next(error);
  }
};

const updatePackageStatus = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const { isActive } = updatePackageStatusValidationSchema.parse({ body: req.body }).body;
    const updatedPackage = await PackageService.updatePackageStatus(id, isActive);
    res.status(httpStatus.OK).json({
      success: true,
      data: updatedPackage,
      message: 'Package status updated successfully',
    });
  } catch (error) {
    next(error);
  }
};

const deletePackage = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const deletedPackage = await PackageService.deletePackage(id);
    res.status(httpStatus.OK).json({
      success: true,
      data: deletedPackage,
      message: 'Package deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};

export const PackageController = {
  createPackage,
  getPackages,
  getSinglePackage,
  getActivePackages,
  updatePackage,
  updatePackageStatus,
  deletePackage,
};