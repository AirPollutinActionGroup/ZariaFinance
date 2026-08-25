import { z } from 'zod';

export const organisationCreateSchema = z.object({
  name: z.string().min(2, 'Organisation name is required'),
  shortName: z
    .string()
    .min(1, 'Short name is required')
    .regex(/^[a-z]+$/, 'Lowercase letters only — no numbers, spaces or special characters'),
  email: z.string().email('Invalid email address'),
  phone: z.string().min(5, 'Phone number is required'),
  webUrl: z.string().optional().or(z.literal('')),
  address1: z.string().min(2, 'Address line 1 is required'),
  address2: z.string().optional(),
  stateId: z.union([z.string(), z.number()]).refine((v) => v !== '' && v != null, 'State is required'),
  cityId: z.union([z.string(), z.number()]).refine((v) => v !== '' && v != null, 'City is required'),
  zipCode: z.string().min(3, 'Zip code is required'),
});

export const organisationCreateDefaults = {
  name: '',
  shortName: '',
  email: '',
  phone: '',
  webUrl: '',
  address1: '',
  address2: '',
  stateId: '',
  cityId: '',
  zipCode: '',
};
