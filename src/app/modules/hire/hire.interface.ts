import { Model, Types } from 'mongoose';

export interface IHire {
  userId: Types.ObjectId | string;
  name: string;
  email: string;
  phoneNumber: string;
  address: {
    flatOrHouseNo?: string;
    address: string;
    state: string;
    city: string;
    town?: string;
    area?: string;
  };
  briefMessage: string;
  status: 'open' | 'in_progress' | 'resolved' | 'closed';
  createdAt: Date;
  updatedAt: Date;
}

export interface HireModel extends Model<IHire> {
  // Add static methods if needed
}