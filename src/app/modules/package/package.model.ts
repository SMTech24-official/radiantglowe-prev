import { Schema, model } from 'mongoose';

export interface IPackage {
  name: string;
  description?: string;
  price: number;
  duration: 'FREE' | 'MONTHLY' | 'YEARLY';
  durationInDays: number | 'UNLIMITED';
  state: 'PAID' | 'FREE';
  features: string[];
  bgColor?: string;
  isActive?: boolean;
  textColor?: string;
  isFreePromo?: boolean;
  freePromoText?: string;
  propertyLimit: number;
}

const packageSchema = new Schema<IPackage>(
  {
    name: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    description: {
      type: String,
      trim: true,
    },
    price: {
      type: Number,
      required: true,
      min: 0,
    },
    duration: {
      type: String,
      enum: ['FREE', 'MONTHLY', 'YEARLY'],
      required: true,
    },
    durationInDays: {
      type: Schema.Types.Mixed,
      required: true,
      min: 0,
    },
    state: {
      type: String,
      enum: ['PAID', 'FREE'],
      required: true,
    },
    features: {
      type: [String],
      required: true,
      default: [],
    },
    propertyLimit: {
      type: Number,
      required: true,
      min: 0,
    },
    bgColor:{
      type: String,
      default: '#ffffff',
    },
    textColor:{
      type: String,
      default: '#000000',
    },
    isFreePromo:{
      type: Boolean,
      default: false,
    },
    freePromoText:{
      type: String,
      default: 'FREE promo for limited period.',
    },
    isActive: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

export const Package = model<IPackage>('Package', packageSchema);