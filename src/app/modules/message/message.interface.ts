import { Model, Types } from 'mongoose';

export interface IMessage {
    senderId: Types.ObjectId;
    receiverId: Types.ObjectId;
    propertyId: Types.ObjectId;
    message?: string; // Optional if imageUrl is provided
    imageUrl?: string; // Optional image URL
    isRead: boolean;
    createdAt: Date;
    updatedAt: Date;
}

export interface MessageModel extends Model<IMessage> {
    // Add any static methods if needed
}