import { z } from 'zod';

export const organisationCreateSchema = z.object({
  name: z.string().min(2, 'Organisation name is required'),
  shortName: z.string().min(1, 'Short name is required'),
  email: z.string().email('Invalid email address'),
  phone: z.string().min(5, 'Phone number is required'),
  webUrl: z.string().optional().or(z.literal('')),
  address1: z.string().min(2, 'Address line 1 is required'),
  address2: z.string().optional(),
  city: z.string().min(2, 'City is required'),
  state: z.string().min(2, 'State is required'),
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
  city: '',
  state: '',
  zipCode: '',
};
