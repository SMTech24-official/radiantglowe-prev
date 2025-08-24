import { z } from 'zod';

export const messageValidationSchema = z.object({
    body: z.object({
        receiverId: z.string().min(1, 'Receiver ID is required'),
        propertyId: z.string().min(1, 'Property ID is required'),
        message: z.string().trim().optional(),
        imageUrl: z.string().url('Invalid URL format').trim().optional(),
    }).refine((data) => !!data.message || !!data.imageUrl, {
        message: 'Either message or imageUrl is required',
        path: ['message', 'imageUrl'],
    }),
});