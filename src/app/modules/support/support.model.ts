import { Schema, model } from 'mongoose';
import { ISupport, SupportModel } from './support.interface';

const supportSchema = new Schema<ISupport, SupportModel>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: false, // Optional for unauthenticated users
    },
    name: {
      type: String,
      required: false,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
    },
    phoneNumber: {
      type: String,
      required: false,
      trim: true,
    },
    message: {
      type: String,
      required: true,
      trim: true,
    },
    messageType: {
      type: String,
      required: false,
      enum: ['technical', 'billing', 'general', 'suggestion', 'other', 'account', 'feature_request'],
    },
    status: {
      type: String,
      enum: ['open', 'resolved'],
      default: 'open',
    },
  },
  {
    timestamps: true,
  }
);

export const Support = model<ISupport, SupportModel>('Support', supportSchema);