import { Schema, model } from 'mongoose';
import { ISubscription } from './subscription.interface';

const subscriptionSchema = new Schema<ISubscription>(
  {
    landlord: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    package: {
      type: Schema.Types.ObjectId,
      ref: 'Package',
      required: true,
    },
    previousPackage: {
      type: Schema.Types.ObjectId,
      ref: 'Package',
      required: false,
    },
    status: {
      type: String,
      enum: ['pending', 'active', 'failed', 'canceled','refunded'],
      default: 'pending',
    },
    state: {
      type: String,
      enum: ['PAID', 'FREE'],
      required: true,
    },
    startDate: {
      type: Date,
      required: true,
    },
    endDate: {
      type: Date,
      required: true,
    },
    paymentIntentId: {
      type: String,
      required: false,
    },
    refundReason: {
      type: String,
      required: false,
    },
  },
  { timestamps: true }
);

export const Subscription = model<ISubscription>('Subscription', subscriptionSchema);