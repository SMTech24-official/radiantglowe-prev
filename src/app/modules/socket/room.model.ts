import { Schema, model, Types, Document } from 'mongoose';

export interface IRoom extends Document {
  senderId: Types.ObjectId;
  receiverId: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
  chat?:any
}

const roomSchema = new Schema<IRoom>(
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
  },
  {
    timestamps: true,
    collection: 'rooms',
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

roomSchema.virtual('chat', {
  ref: 'Chat',
  localField: '_id',
  foreignField: 'roomId',
  justOne: false,
});

export const Room = model<IRoom>('Room', roomSchema);
