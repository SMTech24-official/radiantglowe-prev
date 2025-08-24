import { Request, Response } from 'express';
import catchAsync from '../../utils/catchAsync';
import { sendResponse } from '../../utils/sendResponse';
import { BookingService } from './booking.services';
import { bookingValidationSchema } from './booking.validation';

const createBooking = catchAsync(async (req: Request, res: Response) => {
  const validatedData = (await bookingValidationSchema.parseAsync({ body: req.body })).body;
  const tenantId = req.user.userId;
  const { landlordId, propertyId, permissionId, paymentMethod, transaction, amount } = validatedData;

  const booking = await BookingService.createBooking(
    tenantId,
    landlordId,
    propertyId,
    permissionId,
    paymentMethod,
    transaction,
    amount
  );

  sendResponse(res, {
    status: 201,
    success: true,
    message: 'Booking created successfully',
    data: booking,
  });
});

const updateBookingPaymentStatus = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const landlordId = req.user.userId;

  const updatedBooking = await BookingService.updateBookingPaymentStatus(id, landlordId);

  sendResponse(res, {
    status: 200,
    success: true,
    message: 'Booking payment status updated to completed successfully',
    data: updatedBooking,
  });
});

const getBookings = catchAsync(async (req: Request, res: Response) => {
  const { tenantId, landlordId, propertyId, paymentMethod, page = '1', limit = '10' } = req.query;
  const filters = {
    tenantId: tenantId as string,
    landlordId: landlordId as string,
    propertyId: propertyId as string,
    paymentMethod: paymentMethod as string,
  };
  const pageNum = parseInt(page as string, 10);
  const limitNum = parseInt(limit as string, 10);

  const { bookings, total } = await BookingService.getBookings(filters, pageNum, limitNum);

  sendResponse(res, {
    status: 200,
    success: true,
    message: 'Bookings retrieved successfully',
    data: { bookings, total, page: pageNum, limit: limitNum },
  });
});

const getLandlordConfirmedTenants = catchAsync(async (req: Request, res: Response) => {
  const landlordId = req.user.userId;
  const { propertyId, page = '1', limit = '10' } = req.query;
  const filters = { propertyId: propertyId as string };
  const pageNum = parseInt(page as string, 10);
  const limitNum = parseInt(limit as string, 10);

  const { bookings, total } = await BookingService.getLandlordConfirmedTenants(landlordId, filters, pageNum, limitNum);

  sendResponse(res, {
    status: 200,
    success: true,
    message: 'All tenants retrieved successfully',
    data: { bookings, total, page: pageNum, limit: limitNum },
  });
});

const getSingleBooking = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const booking = await BookingService.getSingleBooking(id);

  sendResponse(res, {
    status: 200,
    success: true,
    message: 'Booking retrieved successfully',
    data: booking,
  });
});

const getBookingInvoice = catchAsync(async (req: Request, res: Response) => {
  const { propertyId } = req.params;
  const pdfBuffer = await BookingService.generateBookingInvoice(propertyId);
  
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=invoice-${propertyId}.pdf`);
    res.setHeader('Content-Length', pdfBuffer.length);
  
    res.status(201).send(pdfBuffer)
});


export const BookingController = {
  createBooking,
  updateBookingPaymentStatus,
  getBookings,
  getLandlordConfirmedTenants,
  getSingleBooking,
  getBookingInvoice,
};