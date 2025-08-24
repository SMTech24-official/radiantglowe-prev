import { z } from 'zod';

const buttonSchema = z.object({
  text: z.string().min(1, 'Button text is required'),
  link: z.string().url('Button link must be a valid URL'),
});

const descriptionSchema = z.object({
  subtitle: z.string().min(1, 'Subtitle is required'),
  subDescription: z.string().min(1, 'Sub-description is required'),
});

const homeContentSchema = z.object({
  forLandlords: z.object({
    title: z.string().min(1, 'Title is required'),
    description: z.string().min(1, 'Description is required'),
    listDescription: z.array(z.string()).min(1, 'At least one description is required'),
    button: buttonSchema,
    image: z.string().url('Image URL must be valid'),
  }),
  forTenants: z.object({
    title: z.string().min(1, 'Title is required'),
    description: z.string().min(1, 'Description is required'),
    listDescription: z.array(z.string()).min(1, 'At least one description is required'),
    button: buttonSchema,
    image: z.string().url('Image URL must be valid'),
  }),
  testimonials: z.object({
    title: z.string().min(1, 'Title is required'),
    description: z.string().min(1, 'Description is required'),
    listDescription: z.array(z.string()).min(1, 'At least one description is required'),
    button: buttonSchema,
    image: z.string().url('Image URL must be valid'),
  }),
});

const aboutUsContentSchema = z.object({
  whoWeAre: z.object({
    title: z.string().min(1, 'Title is required'),
    description: z.string().min(1, 'Description is required'),
    listDescription: z.array(z.string()).min(1, 'At least one description is required'),
    button: buttonSchema,
    image: z.string().url('Image URL must be valid'),
  }),
  ourMission: z.object({
    title: z.string().min(1, 'Title is required'),
    description: z.string().min(1, 'Description is required'),
    listDescription: z.array(z.string()).min(1, 'At least one description is required'),
    button: buttonSchema,
    image: z.string().url('Image URL must be valid'),
  }),
  ourVision: z.object({
    title: z.string().min(1, 'Title is required'),
    description: z.string().min(1, 'Description is required'),
    listDescription: z.array(z.string()).min(1, 'At least one description is required'),
    button: buttonSchema,
    image: z.string().url('Image URL must be valid'),
  }),
});

const faqContentSchema = z.object({
  faqs: z.array(
    z.object({
      question: z.string().min(1, 'Question is required'),
      answer: z.string().min(1, 'Answer is required'),
    })
  ).min(1, 'At least one FAQ is required'),
});

const termsAndConditionsContentSchema = z.object({
  sections: z.array(
    z.object({
      title: z.string().min(1, 'Title is required'),
      descriptions: z.array(descriptionSchema).min(1, 'At least one description is required'),
    })
  ).min(1, 'At least one section is required'),
});

const contactUsContentSchema = z.object({
  email: z.string().email('Valid email is required'),
  phone: z.string().min(1, 'Phone number is required'),
  address: z.string().min(1, 'Address is required'),
  facebook: z.string().url('Facebook URL must be valid').optional(),
  instagram: z.string().url('Instagram URL must be valid').optional(),
  twitter: z.string().url('Twitter URL must be valid').optional(),
  linkedin: z.string().url('LinkedIn URL must be valid').optional(),
  youtube: z.string().url('YouTube URL must be valid').optional(),
  tiktok: z.string().url('TikTok URL must be valid').optional(),
});

export const pageValidationSchemas = {
  // home: z.object({ body: homeContentSchema }),
  // aboutUs: z.object({ body: aboutUsContentSchema }),
  faq: z.object({ body: faqContentSchema }),
  termsAndConditions: z.object({ body: termsAndConditionsContentSchema }),
  contactUs: z.object({ body: contactUsContentSchema }),
};