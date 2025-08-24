import { Router } from 'express';
import { PropertyReviewController } from './propertyReview.controller';
import validateRequest from '../../middleware/validateRequest';
import { reviewPropertyValidationSchema, likeReviewValidationSchema, dislikeReviewValidationSchema, homePageViewValidationSchema, editReviewValidationSchema } from './propertyReview.validation';
import auth from '../../middleware/auth';
import isVerified from '../../middleware/isVerified';

const router = Router();

router.post('/', validateRequest(reviewPropertyValidationSchema), PropertyReviewController.createReview);
router.post('/:id/like', auth('tenant','landlord'), PropertyReviewController.likeReview);
router.post('/:id/dislike', auth('tenant','landlord'), PropertyReviewController.dislikeReview);
router.get('/:id/rating', PropertyReviewController.getPropertyRating);
router.get('/:propertyId/reviews', PropertyReviewController.getReviewsByProperty);
router.get('/', PropertyReviewController.getAllReviews);
router.patch('/:id/homepage', auth('admin'), PropertyReviewController.updateHomePageViewStatus);
router.put('/:id', auth('admin'), PropertyReviewController.editReview);
router.get('/homepage', PropertyReviewController.getHomePageReviews);

export const PropertyReviewRoutes = router;