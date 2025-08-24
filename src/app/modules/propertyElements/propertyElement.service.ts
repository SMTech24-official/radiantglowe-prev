import { Document } from 'mongoose';
import AppError from '../../error/appError';
import httpStatus from 'http-status';
import { IPropertyType, IPropertyTypes, PropertyTypes } from './propertyElement.model';

// Extend IPropertyTypes with Document to include Mongoose methods
interface IPropertyTypesDocument extends IPropertyTypes, Document {}

const ensureSingleDocument = async (): Promise<IPropertyTypesDocument> => {
  let propertyTypes = await PropertyTypes.findOne();
  if (!propertyTypes) {
    propertyTypes = await PropertyTypes.create({});
  }
  return propertyTypes as IPropertyTypesDocument;
};

const createPropertyTypes = async (propertyTypesData: Partial<IPropertyTypes>): Promise<IPropertyTypes> => {
  const propertyTypes = await ensureSingleDocument();

  if (propertyTypesData.propertyTypes) {
    const existingTitles = new Set(propertyTypes.propertyTypes.map((pt) => pt.title));
    const newPropertyTypes = propertyTypesData.propertyTypes.filter((pt) => !existingTitles.has(pt.title));
    (propertyTypes.propertyTypes as IPropertyType[]).push(...newPropertyTypes);
  }
  if (propertyTypesData.accessTypes) {
    const newAccessTypes = propertyTypesData.accessTypes.filter((at) => !propertyTypes.accessTypes.includes(at));
    (propertyTypes.accessTypes as string[]).push(...newAccessTypes);
  }
  if (propertyTypesData.featureTypes) {
    const newFeatureTypes = propertyTypesData.featureTypes.filter((ft) => !propertyTypes.featureTypes.includes(ft));
    (propertyTypes.featureTypes as string[]).push(...newFeatureTypes);
  }

  const result = await propertyTypes.save();
  return result;
};

const getPropertyTypes = async (): Promise<IPropertyTypes> => {
  const propertyTypes = await ensureSingleDocument();
  return propertyTypes;
};

const updatePropertyTypes = async (updatedData: Partial<IPropertyTypes> & { propertyTypes?: Array<IPropertyType & { newTitle?: string }> }): Promise<IPropertyTypes> => {
  const propertyTypes = await ensureSingleDocument();

  if (updatedData.propertyTypes) {
    const updatedPropertyTypes: IPropertyType[] = [];
    const existingTitles = new Set(propertyTypes.propertyTypes.map((pt) => pt.title));

    for (const newPt of updatedData.propertyTypes) {
      const existingPtIndex = propertyTypes.propertyTypes.findIndex((pt) => pt.title === newPt.title);
      if (existingPtIndex !== -1) {
        // Update existing entry's icon and/or title
        if (newPt.icon) {
          propertyTypes.propertyTypes[existingPtIndex].icon = newPt.icon;
        }
        if (newPt.newTitle && newPt.newTitle !== newPt.title && !existingTitles.has(newPt.newTitle)) {
          propertyTypes.propertyTypes[existingPtIndex].title = newPt.newTitle;
          existingTitles.delete(newPt.title); // Remove old title from set
          existingTitles.add(newPt.newTitle); // Add new title to prevent duplicates
        }
      } else {
        // Add new entry if title doesn't exist
        updatedPropertyTypes.push({ icon: newPt.icon, title: newPt.newTitle || newPt.title });
      }
    }
    (propertyTypes.propertyTypes as IPropertyType[]).push(...updatedPropertyTypes);
  }

  if (updatedData.accessTypes) {
    const newAccessTypes = updatedData.accessTypes.filter((at) => !propertyTypes.accessTypes.includes(at));
    (propertyTypes.accessTypes as string[]).push(...newAccessTypes);
  }

  if (updatedData.featureTypes) {
    const newFeatureTypes = updatedData.featureTypes.filter((ft) => !propertyTypes.featureTypes.includes(ft));
    (propertyTypes.featureTypes as string[]).push(...newFeatureTypes);
  }

  const result = await propertyTypes.save();
  return result;
};

const deletePropertyType = async (type: string, value: string): Promise<IPropertyTypes> => {
  const propertyTypes = await ensureSingleDocument();


  if (type === 'propertyTypes') {
    propertyTypes.propertyTypes = propertyTypes.propertyTypes.filter((item) => item.title !== value);
  } else if (type === 'accessTypes') {
    propertyTypes.accessTypes = propertyTypes.accessTypes.filter((item) => item !== value);
  } else if (type === 'featureTypes') {
    propertyTypes.featureTypes = propertyTypes.featureTypes.filter((item) => item !== value);
  } else {
    throw new AppError(httpStatus.BAD_REQUEST, 'Invalid type specified');
  }

  const result = await propertyTypes.save();
  return result;
};

export const PropertyTypesService = {
  createPropertyTypes,
  getPropertyTypes,
  updatePropertyTypes,
  deletePropertyType,
};