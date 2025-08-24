import { Schema, model } from 'mongoose';
import { IProperty } from './property.interface';
import { PropertyTypes } from '../propertyElements/propertyElement.model';

export const furnishedTypes = ['fully_furnished', 'semi_furnished', 'unfurnished'] as const;

const propertySchema = new Schema<IProperty>(
  {
      PID: {
      type: Number,
      unique: true,
    },
    landlordId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    headlineYourProperty: {
      type: String,
      required: false,
      trim: true,
    },
    propertyType: {
      type: String,
      required: true,
      validate: {
        validator: async function (value: string) {
          const propertyTypesDoc = await PropertyTypes.findOne();
          return propertyTypesDoc?.propertyTypes.some(pt => pt.title === value) || false;
        },
        message: 'Invalid property type',
      },
    },
    bedrooms: {
      type: Number,
      required: true,
      min: 0,
    },
    bathrooms: {
      type: Number,
      required: true,
      min: 0,
    },
    livingRooms: {
      type: Number,
      required: true,
      min: 0,
    },
    kitchen: {
      type: Number,
      required: true,
      min: 0,
    },
    location: {
      flatOrHouseNo: {
        type: String,
        required: false,
      },
      address: {
        type: String,
        required: true,
      },
      state: {
        type: String,
        required: true,
      },
      city: {
        type: String,
        required: true,
      },
      town: {
        type: String,
        required: true,
      },
      area: {
        type: String,
        required: false,
      },
    },
    description: {
      type: String,
      required: false,
      trim: true,
    },
    images: [{
      type: String,
      required: true,
    }],
    status: {
      type: String,
      enum: ['available', 'rented', 'pending','booking'],
      default: 'available',
    },
    gender: {
      type: String,
      required: false,
    },
    features: {
      type: [String],
      required: false,
      // validate: {
      //   validator: async function (values: string[]) {
      //     const propertyTypesDoc = await PropertyTypes.findOne();
      //     return values.every(value => propertyTypesDoc?.featureTypes.includes(value));
      //   },
      //   message: 'Invalid feature type',
      // },
    },
    formAvailable: {
      type: String,
      required: true,
    },
    furnished: {
      type: String,
      enum: furnishedTypes,
      required: false,
    },
    ages: {
      type: String,
      required: false,
    },
    rentPerYear: {
      type: Number,
      required: true,
      min: 0,
    },
    rentPerMonth: {
      type: Number,
      required: false,
      min: 0,
    },
    rentPerDay: {
      type: Number,
      required: false,
      min: 0,
    },
    serviceCharge: {
      type: Number,
      required: false,
      min: 0,
    },
    depositAmount: {
      type: Number,
      required: false,
      min: 0,
    },
    isIncludeAllUtilityWithService: {
      type: Boolean,
      required: false,
      default: false,
    },
    minimumLengthOfContract: {
      type: Number,
      required: false,
      min: 0,
    },
    isReferenceRequired: {
      type: Boolean,
      required: false,
      default: false,
    },
    accessYourProperty: {
      type: [String],
      required: false,
      // validate: {
      //   validator: async function (values: string[]) {
      //     const propertyTypesDoc = await PropertyTypes.findOne();
      //     return values.every(value => propertyTypesDoc?.accessTypes.includes(value));
      //   },
      //   message: 'Invalid access type',
      // },
    },
    mediaLink: {
      type: String,
      required: false,
    },
    isAcceptTermsAndCondition: {
      type: Boolean,
      required: false,
      default: false,
    },
    isRemoteVideoView: {
      type: Boolean,
      required: false,
      default: false,
    },
     isHomePageView: {
      type: Boolean,
      default: false,
    },
    isActive: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

// Pre-save hook to generate sequential PID
propertySchema.pre('save', async function (next) {
  if (this.isNew) {
    const lastProperty = await this.model('Property')
      .findOne()
      .sort({ PID: -1 })
      .select('PID')
      .lean();

    this.PID = lastProperty ? (lastProperty as any).PID + 1 : 1;
  }
  next();
});


export const Property = model<IProperty>('Property', propertySchema);