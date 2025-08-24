import { Document, Types } from 'mongoose';
import { IPropertyReview } from './propertyReview.interface';
import { PropertyReview } from './propertyReview.model';
import AppError from '../../error/appError';
import httpStatus from 'http-status';
import { User } from '../user/user.model';
import { Property } from '../property/property.model';

interface IPropertyReviewDocument extends IPropertyReview, Document {}

const createReview = async (userId: string | undefined, reviewData: IPropertyReview): Promise<IPropertyReview> => {
 if(userId && userId !== ''){
   const user = await User.findById(userId);
  if (!user) {
    throw new AppError(httpStatus.FORBIDDEN, 'Only Tenant can submit reviews');
  }
 }
  const property = await Property.findById(reviewData.property);
  if (!property) {
    throw new AppError(httpStatus.NOT_FOUND, 'Property not found');
  }
  reviewData.user = userId ? new Types.ObjectId(userId) : undefined;
  const review = await PropertyReview.create(reviewData);
  return review;
};

const likeReview = async (reviewId: string, userId: string): Promise<IPropertyReview | null> => {
  const review = await PropertyReview.findById(reviewId);
  if (!review) {
    throw new AppError(httpStatus.NOT_FOUND, 'Review not found');
  }
  const user = await User.findById(userId);
  if (!user) {
    throw new AppError(httpStatus.FORBIDDEN, 'Only users can like reviews');
  }
  if (review.likes.includes(new Types.ObjectId(userId))) {
    throw new AppError(httpStatus.BAD_REQUEST, 'Review already liked by user');
  }
  if (review.dislikes.includes(new Types.ObjectId(userId))) {
    review.dislikes = review.dislikes.filter(id => id.toString() !== userId);
  }
  review.likes.push(new Types.ObjectId(userId));
  const updatedReview = await review.save();
  return updatedReview;
};

const dislikeReview = async (reviewId: string, userId: string): Promise<IPropertyReview | null> => {
  const review = await PropertyReview.findById(reviewId);
  if (!review) {
    throw new AppError(httpStatus.NOT_FOUND, 'Review not found');
  }
  const user = await User.findById(userId);
  if (!user) {
    throw new AppError(httpStatus.FORBIDDEN, 'Only users can dislike reviews');
  }
  if (review.dislikes.includes(new Types.ObjectId(userId))) {
    throw new AppError(httpStatus.BAD_REQUEST, 'Review already disliked by user');
  }
  if (review.likes.includes(new Types.ObjectId(userId))) {
    review.likes = review.likes.filter(id => id.toString() !== userId);
  }
  review.dislikes.push(new Types.ObjectId(userId));
  const updatedReview = await review.save();
  return updatedReview;
};

const getPropertyRating = async (propertyId: string): Promise<{
  averageRating: number;
  ratingCounts: { [key: number]: number };
  totalReviews: number;
}> => {
  const property = await Property.findById(propertyId);
  if (!property) {
    throw new AppError(httpStatus.NOT_FOUND, 'Property not found');
  }

  const reviews = await PropertyReview.find({ property: propertyId });
  const totalReviews = reviews.length;
  const averageRating =
    totalReviews > 0
      ? reviews.reduce((sum, review) => sum + review.rating, 0) / totalReviews
      : 0;

  const ratingCounts: Record<1 | 2 | 3 | 4 | 5, number> = {
    1: 0,
    2: 0,
    3: 0,
    4: 0,
    5: 0,
  };

  reviews.forEach((review) => {
    const rating = review.rating as 1 | 2 | 3 | 4 | 5;
    ratingCounts[rating] += 1;
  });

  return { averageRating, ratingCounts, totalReviews };
};

const getReviewsByProperty = async (propertyId: string): Promise<IPropertyReview[]> => {
  const property = await Property.findById(propertyId);
  if (!property) {
    throw new AppError(httpStatus.NOT_FOUND, 'Property not found');
  }
  const reviews = await PropertyReview.find({ property: propertyId }).populate('user');
  return reviews;
};

const getAllReviews = async (): Promise<IPropertyReview[]> => {
  const reviews = await PropertyReview.find().sort({ createdAt: -1 }).populate('user','name email role').populate('property','headlineYourProperty propertyType location');
  return reviews;
};

const updateHomePageViewStatus = async (reviewId: string, isHomePageView: boolean): Promise<IPropertyReview | null> => {
  const review = await PropertyReview.findById(reviewId);
  if (!review) {
    throw new AppError(httpStatus.NOT_FOUND, 'Review not found');
  }
  const isActive = !review.isHomePageView;
  const updatedReview = await PropertyReview.findByIdAndUpdate(reviewId, { isHomePageView: isActive }, { new: true }).exec();
  return updatedReview;
};

const editReview = async (reviewId: string, reviewData: Partial<IPropertyReview>): Promise<IPropertyReview | null> => {
  const review = await PropertyReview.findById(reviewId);
  if (!review) {
    throw new AppError(httpStatus.NOT_FOUND, 'Review not found');
  }
  const updatedReview = await PropertyReview.findByIdAndUpdate(reviewId, reviewData, { new: true });
  return updatedReview;
};

const getHomePageReviews = async (): Promise<IPropertyReview[]> => {
  const reviews = await PropertyReview.find({ isHomePageView: true })
    .sort({ createdAt: -1 })
    .populate('user', 'name email role');
  return reviews;
};

export const PropertyReviewService = {
  createReview,
  likeReview,
  dislikeReview,
  getPropertyRating,
  getReviewsByProperty,
  getAllReviews,
  updateHomePageViewStatus,
  editReview,
  getHomePageReviews,
};