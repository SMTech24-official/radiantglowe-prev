import { Document } from 'mongoose';
import { IPackage } from './package.model';
import { Package } from './package.model';
import AppError from '../../error/appError';
import httpStatus from 'http-status';
import { Subscription } from '../subscription/subscription.model';

// Extend IPackage with Document for Mongoose methods
interface IPackageDocument extends IPackage, Document {}

const createPackage = async (packageData: IPackage): Promise<IPackage> => {
  const existingPackage = await Package.findOne({ name: packageData.name });
  if (existingPackage) {
    throw new AppError(httpStatus.BAD_REQUEST, 'Package with this name already exists');
  }
  const newPackage = await Package.create(packageData);
  return newPackage;
};

const getPackages = async (): Promise<IPackage[]> => {
  const packages = await Package.find();
  return packages;
};

const getSinglePackage = async (id: string): Promise<IPackage | null> => {
  const packageDoc = await Package.findById(id);
  if (!packageDoc) {
    throw new AppError(httpStatus.NOT_FOUND, 'Package not found');
  }
  return packageDoc;
};

// get active packages
const getActivePackages = async (): Promise<IPackage[]> => {
  const packages = await Package.find({ isActive: true });
  return packages;
};

const updatePackage = async (id: string, updatedData: Partial<IPackage>): Promise<IPackage | null> => {
  if (updatedData.name) {
    const existingPackage = await Package.findOne({ name: updatedData.name, _id: { $ne: id } });
    if (existingPackage) {
      throw new AppError(httpStatus.BAD_REQUEST, 'Package with this name already exists');
    }
  }
  const packageDoc = await Package.findByIdAndUpdate(id, updatedData, {
    new: true,
    runValidators: true,
  });
  if (!packageDoc) {
    throw new AppError(httpStatus.NOT_FOUND, 'Package not found');
  }
  return packageDoc;
};

const updatePackageStatus = async (id: string, isActive: boolean): Promise<IPackage | null> => {
  const packageDoc = await Package.findByIdAndUpdate(id, { isActive }, {
    new: true,
    runValidators: true,
  });
  if (!packageDoc) {
    throw new AppError(httpStatus.NOT_FOUND, 'Package not found');
  }
  return packageDoc;
};

const deletePackage = async (id: string): Promise<IPackage | null> => {
  // Start a session for transaction
  const session = await Package.startSession();
  try {
    session.startTransaction();

    // Delete all subscriptions referencing this package
    await Subscription.deleteMany({ package: id }, { session });

    // Delete the package
    const packageDoc = await Package.findByIdAndDelete(id, { session });
    
    if (!packageDoc) {
      throw new AppError(httpStatus.NOT_FOUND, 'Package not found');
    }

    // Commit the transaction
    await session.commitTransaction();
    session.endSession();

    return packageDoc;
  } catch (error) {
    // Abort transaction on error
    await session.abortTransaction();
    session.endSession();
    throw error;
  }
};


export const PackageService = {
  createPackage,
  getPackages,
  getSinglePackage,
  getActivePackages,
  updatePackage,
  updatePackageStatus,
  deletePackage,
};