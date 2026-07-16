import { z } from 'zod';
import { DONOR_TYPE, FUND_SOURCE_DOMICILE } from '../constants.js';

/**
 * Mirrors CreateDonorRequest bean validation:
 * donorCode/donorName/donorType/fundSourceDomicile/email/spocNameOfThePerson/
 * spocEmail @NotBlank or @NotNull, email/spocEmail @Email; everything else optional.
 */
export const donorSchema = z.object({
  donorCode: z.string().trim().min(1, 'Donor code is required'),
  donorName: z.string().trim().min(1, 'Donor name is required'),
  donorType: z.enum(Object.keys(DONOR_TYPE), { message: 'Donor type is required' }),
  fundSourceDomicile: z.enum(Object.keys(FUND_SOURCE_DOMICILE), {
    message: 'Fund source domicile is required',
  }),
  fcraApplicable: z.boolean().optional(),
  foreignFundSourceType: z.string().trim().optional().or(z.literal('')),
  foreignCountryId: z.string().trim().optional().or(z.literal('')),
  panCardNumber: z.string().trim().optional().or(z.literal('')),
  foreignTaxIdentifier: z.string().trim().optional().or(z.literal('')),
  email: z.string().trim().min(1, 'Email is required').email('Email must be valid'),
  phoneNumber: z.string().trim().optional().or(z.literal('')),
  website: z.string().trim().optional().or(z.literal('')),
  spocNameOfThePerson: z.string().trim().min(1, 'SPOC name is required'),
  spocPhoneNumber: z.string().trim().optional().or(z.literal('')),
  spocEmail: z.string().trim().min(1, 'SPOC email is required').email('SPOC email must be valid'),
  address: z.string().trim().optional().or(z.literal('')),
  address2: z.string().trim().optional().or(z.literal('')),
  cityId: z.union([z.number(), z.string()]).optional().or(z.literal('')).nullable(),
  stateId: z.union([z.number(), z.string()]).optional().or(z.literal('')).nullable(),
  countryId: z.union([z.number(), z.string()]).optional().or(z.literal('')).nullable(),
  postalCode: z.string().trim().optional().or(z.literal('')),
  registrationNumber: z.string().trim().optional().or(z.literal('')),
});

export const donorFormDefaults = {
  donorCode: '',
  donorName: '',
  donorType: '',
  fundSourceDomicile: '',
  fcraApplicable: false,
  foreignFundSourceType: '',
  foreignCountryId: '',
  panCardNumber: '',
  foreignTaxIdentifier: '',
  email: '',
  phoneNumber: '',
  website: '',
  spocNameOfThePerson: '',
  spocPhoneNumber: '',
  spocEmail: '',
  address: '',
  address2: '',
  cityId: '',
  stateId: '',
  countryId: '',
  postalCode: '',
  registrationNumber: '',
};
