import { Router } from 'express';
import auth from '../../middleware/auth';
import isVerified from '../../middleware/isVerified';
import validateRequest from '../../middleware/validateRequest';
import { BookingController } from './booking.controller';
import { bookingValidationSchema } from './booking.validation';

const router = Router();

router.post('/', auth('tenant'), isVerified, validateRequest(bookingValidationSchema), BookingController.createBooking);
router.get('/', auth('admin', 'landlord', 'tenant'), BookingController.getBookings);
router.get('/my-tenants', auth('landlord'), isVerified, BookingController.getLandlordConfirmedTenants);
router.get('/invoice/:propertyId', auth('admin', 'landlord', 'tenant'), BookingController.getBookingInvoice);
router.patch('/:id/status', auth('landlord'), isVerified, BookingController.updateBookingPaymentStatus);
router.get('/:id', auth('admin', 'landlord', 'tenant'), BookingController.getSingleBooking);

export const BookingRoutes = router;