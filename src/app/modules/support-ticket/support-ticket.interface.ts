
import { Model, Types } from 'mongoose';

export interface IMessage {
  _id?: Types.ObjectId;
  sender: 'user' | 'admin';
  content: string;
  createdAt: Date;
}

export interface ISupportTicket {
  userId: Types.ObjectId;
  ticketNumber: string;
  title: string;
  description: string;
  category: 'technical' | 'billing' | 'general' | 'suggestion' | 'other' | 'account' | 'feature_request';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  status: 'open' | 'in_progress' | 'resolved' | 'closed';
  messages: IMessage[];
  createdAt: Date;
  updatedAt: Date;
}

export interface SupportTicketModel extends Model<ISupportTicket> {
  // Add any static methods if needed
}
