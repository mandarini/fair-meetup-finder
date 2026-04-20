import { z } from 'zod';

export const locationSchema = z.object({
  lat: z.number(),
  lng: z.number(),
  address: z.string().min(1, 'Location is required'),
});

export const friendSchema = z.object({
  name: z.string().min(1, 'Name is required').max(100),
  location: locationSchema,
});

export const groupSchema = z.object({
  name: z.string().min(1, 'Group name is required').max(50),
  emoji: z.string().max(2).default('👥'),
});

export type FriendFormData = z.infer<typeof friendSchema>;
export type GroupFormData = z.infer<typeof groupSchema>;
