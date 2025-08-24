import { Model, Types } from 'mongoose';

export interface ISupport {
  userId?: Types.ObjectId; // Optional userId for unauthenticated users
  name: string;
  email: string;
  message: string;
  status: 'open' | 'resolved'; 
  phoneNumber?: string,
  messageType?: 'technical' | 'billing' | 'general' | 'suggestion' | 'other' | 'account' | 'feature_request';
  createdAt: Date;
  updatedAt: Date;
}

export interface SupportModel extends Model<ISupport> {
  // Add any static methods if needed
}