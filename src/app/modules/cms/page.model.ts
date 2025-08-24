import { Schema, model } from 'mongoose';
import { IPage } from './page.interface';

const buttonSchema = new Schema({
  text: { type: String, required: true },
  link: { type: String, required: true },
});

const descriptionSchema = new Schema({
  subtitle: { type: String, required: true },
  subDescription: { type: String, required: true },
});

const pageSchema = new Schema<IPage>(
  {
    pageName: {
      type: String,
      required: true,
      unique: true,
      enum: ['home', 'aboutUs', 'faq', 'termsAndConditions', 'contactUs','privacyPolicy','pricing'],
    },
    content: {
      type: Schema.Types.Mixed, // Flexible to store different structures
      required: true,
    },
  },
  { timestamps: true }
);

export const Page = model<IPage>('Page', pageSchema);