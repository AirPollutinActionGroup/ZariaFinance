import { z } from 'zod';

/**
 * Mirrors CreateGrantRequest bean validation, including the class-level
 * @ValidGrantDates rule (endDate must not precede startDate).
 *
 * A grant inherits its donor, programme and class from its fund profile, so the
 * form selects a donor (to scope the profile list) and a fund profile. Only
 * fundProfileId is sent to the backend; donorId is UX-only.
 */
export const grantSchema = z
  .object({
    grantCode: z.string().trim().min(1, 'Grant code is required'),
    donorId: z.string().trim().min(1, 'Donor is required'),
    fundProfileId: z.string().trim().min(1, 'Fund profile is required'),
    agreementName: z.string().trim().min(1, 'Agreement name is required'),
    agreementDate: z.string().min(1, 'Agreement date is required'),
    startDate: z.string().min(1, 'Start date is required'),
    endDate: z.string().min(1, 'End date is required'),
    totalGrantAmount: z
      .string()
      .trim()
      .min(1, 'Total grant amount is required')
      .refine((v) => Number(v) > 0, 'Total grant amount must be positive'),
    grantCurrency: z.string().trim().min(1, 'Currency is required'),
    fxLockedRate: z
      .string()
      .trim()
      .min(1, 'FX rate is required')
      .refine((v) => Number(v) > 0, 'FX rate must be positive'),
    description: z.string().trim().optional().or(z.literal('')),
    agreementDocumentPath: z.string().trim().optional().or(z.literal('')),
  })
  .refine((values) => !values.startDate || !values.endDate || values.endDate >= values.startDate, {
    message: 'End date cannot be before start date',
    path: ['endDate'],
  });

export const grantFormDefaults = {
  grantCode: '',
  donorId: '',
  fundProfileId: '',
  agreementName: '',
  agreementDate: '',
  startDate: '',
  endDate: '',
  totalGrantAmount: '',
  grantCurrency: 'INR',
  fxLockedRate: '1',
  description: '',
  agreementDocumentPath: '',
};
