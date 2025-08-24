import { Schema, model } from 'mongoose';
import { IMessage, MessageModel } from './message.interface';

const messageSchema = new Schema<IMessage, MessageModel>(
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
        propertyId: {
            type: Schema.Types.ObjectId,
            ref: 'Property',
            required: true,
        },
        message: {
            type: String,
            required: false, // Message is optional if imageUrl is provided
            trim: true,
        },
        imageUrl: {
            type: String,
            required: false, // Image URL is optional
            trim: true,
        },
        isRead: {
            type: Boolean,
            default: false,
        },
    },
    {
        timestamps: true,
    }
);

messageSchema.pre('validate', function (next) {
    if (!this.message && !this.imageUrl) {
        this.invalidate('message', 'Either message or imageUrl is required');
    }
    next();
});

export const Message = model<IMessage, MessageModel>('Message', messageSchema);