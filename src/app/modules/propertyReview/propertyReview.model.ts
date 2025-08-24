import { Schema, model } from 'mongoose';
import { IPropertyReview } from './propertyReview.interface';

const propertyReviewSchema = new Schema<IPropertyReview>(
  {
    property: {
      type: Schema.Types.ObjectId,
      ref: 'Property',
      required: true,
    },
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: false,
    },
    name: {
      type: String,
      required: false,
      trim: true,
    },
    rating: {
      type: Number,
      required: true,
      min: 1,
      max: 5,
    },
    reviewText: {
      type: String,
      required: false,
      trim: true,
    },
    likes: [{
      type: Schema.Types.ObjectId,
      ref: 'User',
      default: [],
    }],
    dislikes: [{
      type: Schema.Types.ObjectId,
      ref: 'User',
      default: [],
    }],
    isHomePageView: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

export const PropertyReview = model<IPropertyReview>('PropertyReview', propertyReviewSchema);