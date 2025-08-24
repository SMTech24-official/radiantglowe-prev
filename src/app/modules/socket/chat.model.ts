import { Schema, model, Types, Document } from 'mongoose';

export interface IChat extends Document {
  senderId: Types.ObjectId;
  receiverId: Types.ObjectId;
  message: string;
  roomId: Types.ObjectId;
  images: string[];
  isRead: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const chatSchema = new Schema<IChat>(
  {
    senderId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    receiverId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    message: {
      type: String,
      required: true,
      trim: true,
    },
    roomId: {
      type: Schema.Types.ObjectId,
      ref: 'Room',
      required: true,
    },
    images: {
      type: [String],
      default: [],
    },
    isRead: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true, // handles createdAt and updatedAt
    collection: 'chats',
  }
);

export const Chat = model<IChat>('Chat', chatSchema);
