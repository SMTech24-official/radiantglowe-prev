import { Schema, model } from 'mongoose';

export interface IPropertyType {
  icon: string;
  title: string;
}

export interface IPropertyTypes {
  propertyTypes: IPropertyType[];
  accessTypes: string[];
  featureTypes: string[];
}

const propertyTypesSchema = new Schema<IPropertyTypes>(
  {
    propertyTypes: {
      type: [
        {
          icon: { type: String, required: true },
          title: { type: String, required: true, unique: true },
        },
      ],
      required: false,
      default: [
        { icon: 'https://img.icons8.com/?id=6AGHyLA8bTw4&format=png&color=000000', title: 'house' },
        { icon: 'https://img.icons8.com/?id=1293&format=png&color=000000', title: 'apartment' },
        { icon: 'https://img.icons8.com/?id=N4AHlohrQYQZ&format=png&color=000000', title: 'duplex' },
        { icon: 'https://img.icons8.com/?id=ZkPSqr2mrrSP&format=png&color=000000', title: 'Boys Quatres' },
        { icon: 'https://img.icons8.com/?id=CRZcjApfsyjZ&format=png&color=000000', title: 'studio apartment' },
        // { icon: 'shared-room', title: 'shared room' },
        // { icon: 'shop', title: 'shop' },
        // { icon: 'retail', title: 'retail space' },
        // { icon: 'restaurant', title: 'restaurant space' },
        // { icon: 'office', title: 'office space' },
        // { icon: 'warehouse', title: 'warehouse' },
        // { icon: 'showroom', title: 'showroom' },
        // { icon: 'garage', title: 'garage' },
        // { icon: 'workshop', title: 'workshop' },
        // { icon: 'land', title: 'empty land' },
        // { icon: 'plot', title: 'plot' },
        // { icon: 'agricultural', title: 'agricultural land' },
        // { icon: 'industrial', title: 'industrial land' },
        // { icon: 'cottage', title: 'resort cottage' },
        // { icon: 'farmhouse', title: 'farm house' },
      ],
    },
    accessTypes: {
      type: [String],
      required: false,
      default: ['students', 'families', 'single', 'couple', 'unemployed', 'smoker', 'professional','pets'],
    },
    featureTypes: {
      type: [String],
      required: false,
      default: ['bills included', 'parking', 'garden access', 'gym', 'roof terrace', 'air conditioning', 'balcony', 'washing machine'],
    },
  },
  { timestamps: true }
);

export const PropertyTypes = model<IPropertyTypes>('PropertyTypes', propertyTypesSchema);