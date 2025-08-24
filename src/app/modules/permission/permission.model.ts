import { Schema, model } from 'mongoose';
import { IPermission } from './permission.interface';

const permissionSchema = new Schema<IPermission>(
  {
    PERID: {
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
    status: {
      type: String,
      enum: ['pending', 'granted', 'denied'],
      default: 'pending',
    },
    requestDate: {
      type: Date,
      required: false,
      default: Date.now,
    },
    responseDate: {
      type: Date,
      required: false,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

// Pre-save hook to generate sequential PID
permissionSchema.pre('save', async function (next) {
  if (this.isNew) {
    const count = await this.model('Permission').countDocuments();
    this.PERID = count + 1;
  }
  next();
});

export const Permission = model<IPermission>('Permission', permissionSchema);