import { Schema, model, Types } from 'mongoose';
import { IHire, HireModel } from './hire.interface';

const hireSchema = new Schema<IHire, HireModel>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: false,
    },
    name: {
      type: String,
      required: true,
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
      required: true,
      trim: true,
    },
    address: {
      flatOrHouseNo: {
        type: String,
        required: false,
        trim: true,
      },
      address: {
        type: String,
        required: true,
        trim: true,
      },
      state: {
        type: String,
        required: true,
        trim: true,
      },
      city: {
        type: String,
        required: true,
        trim: true,
      },
      town: {
        type: String,
        required: false,
        trim: true,
      },
      area: {
        type: String,
        required: false,
        trim: true,
      },
    },
    briefMessage: {
      type: String,
      required: true,
      trim: true,
    },
    status: {
      type: String,
      enum: ['open', 'in_progress', 'resolved', 'closed'],
      default: 'open',
    },
  },
  {
    timestamps: true,
  }
);

export const Hire = model<IHire, HireModel>('Hire', hireSchema);