import { z } from 'zod';
import { FUND_CLASS } from '../constants.js';

/**
 * Mirrors CreateGrantRequest bean validation, including the class-level
 * @ValidGrantDates rule (endDate must not precede startDate).
 */
export const grantSchema = z
  .object({
    grantCode: z.string().trim().min(1, 'Grant code is required'),
    donorId: z.string().trim().min(1, 'Donor is required'),
    programmeId: z
      .string()
      .trim()
      .min(1, 'Programme ID is required')
      .regex(/^\d+$/, 'Programme ID must be a number'),
    agreementName: z.string().trim().min(1, 'Agreement name is required'),
    agreementDate: z.string().min(1, 'Agreement date is required'),
    startDate: z.string().min(1, 'Start date is required'),
    endDate: z.string().min(1, 'End date is required'),
    totalGrantAmount: z
      .string()
      .trim()
      .min(1, 'Total grant amount is required')
      .refine((v) => Number(v) > 0, 'Total grant amount must be positive'),
    fundClass: z.enum(Object.keys(FUND_CLASS), { message: 'Fund class is required' }),
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
  programmeId: '',
  agreementName: '',
  agreementDate: '',
  startDate: '',
  endDate: '',
  totalGrantAmount: '',
  fundClass: '',
  description: '',
  agreementDocumentPath: '',
};
