import { z } from 'zod';
import { FUND_CLASS } from '../constants.js';

/**
 * Mirrors CreateDonorRequest bean validation:
 * donorCode/donorName/donorType/email @NotBlank, email @Email,
 * fundClass @NotNull; everything else optional.
 */
export const donorSchema = z.object({
  donorCode: z.string().trim().min(1, 'Donor code is required'),
  donorName: z.string().trim().min(1, 'Donor name is required'),
  donorType: z.string().trim().min(1, 'Donor type is required'),
  fundClass: z.enum(Object.keys(FUND_CLASS), { message: 'Fund class is required' }),
  email: z.string().trim().min(1, 'Email is required').email('Email must be valid'),
  phoneNumber: z.string().trim().optional().or(z.literal('')),
  website: z.string().trim().optional().or(z.literal('')),
  registrationNumber: z.string().trim().optional().or(z.literal('')),
  taxId: z.string().trim().optional().or(z.literal('')),
  address: z.string().trim().optional().or(z.literal('')),
  cityId: z.string().trim().regex(/^\d*$/, 'City ID must be a number').optional().or(z.literal('')),
  stateId: z.string().trim().regex(/^\d*$/, 'State ID must be a number').optional().or(z.literal('')),
  country: z.string().trim().optional().or(z.literal('')),
  postalCode: z.string().trim().optional().or(z.literal('')),
});

export const donorFormDefaults = {
  donorCode: '',
  donorName: '',
  donorType: '',
  fundClass: '',
  email: '',
  phoneNumber: '',
  website: '',
  registrationNumber: '',
  taxId: '',
  address: '',
  cityId: '',
  stateId: '',
  country: '',
  postalCode: '',
};
