import { Types } from 'mongoose';

export interface IPermission {
  PERID?: number; // Permission ID, auto-generated
  tenantId: Types.ObjectId | string;
  landlordId: Types.ObjectId | string;
  propertyId: Types.ObjectId | string;
  status?: 'pending' | 'granted' | 'denied';
  requestDate?: Date;
  responseDate?: Date;
  isActive?: boolean;
}