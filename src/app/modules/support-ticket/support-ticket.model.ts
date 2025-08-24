
import { Schema, model } from 'mongoose';
import { ISupportTicket, SupportTicketModel } from './support-ticket.interface';

const messageSchema = new Schema(
  {
    sender: {
      type: String,
      enum: ['user', 'admin'],
      required: true,
    },
    content: {
      type: String,
      required: true,
      trim: true,
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
  },
  { _id: true }
);

const supportTicketSchema = new Schema<ISupportTicket, SupportTicketModel>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    ticketNumber: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      required: true,
      trim: true,
    },
    category: {
      type: String,
      required: true,
      enum: ['technical', 'billing', 'general', 'suggestion', 'other', 'account', 'feature_request'],
    },
    priority: {
      type: String,
      enum: ['low', 'medium', 'high', 'urgent'],
      default: 'medium',
    },
    status: {
      type: String,
      enum: ['open', 'in_progress', 'resolved', 'closed'],
      default: 'open',
    },
    messages: [messageSchema],
  },
  {
    timestamps: true,
  }
);

export const SupportTicket = model<ISupportTicket, SupportTicketModel>('SupportTicket', supportTicketSchema);