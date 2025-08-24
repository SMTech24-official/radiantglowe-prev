
import { Types } from 'mongoose';


export interface IBooking {
  BID: number;
  tenantId: Types.ObjectId | string;
  landlordId: Types.ObjectId | string;
  propertyId: Types.ObjectId | string;
  permissionId: Types.ObjectId | string;
  paymentMethod: 'online' | 'offline';
  paymentStatus: 'pending' | 'completed' | 'failed';
  amount: number;
  bookingDate: Date;
  paymentDate?: Date;
  transaction?: {
    message?: string;
    redirecturl?: string;
    reference: string;
    status: string;
    trans?: string;
    transaction: string;
    trxref?: string;
  };
  paymentInfo?: any
  isActive: boolean;
}