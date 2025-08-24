import { Types } from 'mongoose';

export interface ISubscription {
  landlord: Types.ObjectId | string;
  package: Types.ObjectId | string;
  previousPackage?: Types.ObjectId | string;
  status: 'pending' | 'active' | 'failed' | 'canceled' | 'refunded';
  state: 'PAID' | 'FREE';
  startDate: Date;
  endDate: Date;
  paymentIntentId?: string;
  refundReason?: string;
}