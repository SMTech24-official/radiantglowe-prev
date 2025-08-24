import { Schema, model } from 'mongoose';
import { IBooking } from './booking.interface';

const transactionSchema = new Schema({
  message: { type: String, required: false },
  redirecturl: { type: String, required: false },
  reference: { type: String, required: true },
  status: { type: String, required: true },
  trans: { type: String, required: false },
  transaction: { type: String, required: true },
  trxref: { type: String, required: false },
});

const bookingSchema = new Schema<IBooking>(
  {
    BID: {
      type: Number,
      unique: true,
    },
    tenantId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    landlordId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    propertyId: {
      type: Schema.Types.ObjectId,
      ref: 'Property',
      required: true,
    },
    permissionId: {
      type: Schema.Types.ObjectId,
      ref: 'Permission',
      required: true,
    },
    paymentMethod: {
      type: String,
      enum: ['online', 'offline'],
      required: true,
    },
    paymentStatus: {
      type: String,
      enum: ['pending', 'completed', 'failed'],
      default: 'pending',
    },
    amount: {
      type: Number,
      required: true,
    },
    bookingDate: {
      type: Date,
      required: true,
      default: Date.now,
    },
    paymentDate: {
      type: Date,
      required: false,
    },
    transaction: {
      type: transactionSchema,
      required: false,
    },
    paymentInfo: {
      type: Schema.Types.Mixed,
      required: false,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

// Pre-save hook to generate sequential BID
bookingSchema.pre('save', async function (next) {
  if (this.isNew) {
    const lastBooking = await this.model('Booking')
      .findOne({})
      .sort({ BID: -1 })
      .select('BID')
      .lean();

    this.BID = lastBooking && (lastBooking as any).BID ? (lastBooking as any).BID + 1 : 1;
  }
  next();
});


// Index to prevent multiple bookings for the same property
// bookingSchema.index({ propertyId: 1 }, { unique: true });

export const Booking = model<IBooking>('Booking', bookingSchema);