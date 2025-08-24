import { Types } from 'mongoose';

export interface IPropertyReview {
  property: Types.ObjectId | string;
  user?: Types.ObjectId | string;
  rating: number;
  reviewText?: string;
  likes: Types.ObjectId[];
  dislikes: Types.ObjectId[];
  isHomePageView: boolean;
  name?: string;
}