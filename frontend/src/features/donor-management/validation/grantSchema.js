import { z } from 'zod';

/**
 * Mirrors CreateGrantRequest bean validation, including the class-level
 * @ValidGrantDates rule (endDate must not precede startDate).
 *
 * The form follows the New Grant Agreement Form: section 1 Agreement, section 2
 * Dates & value, section 3 Approval.
 *
 * Not validated here because the server owns them:
 *  - grantCode        auto-generated (ZRY/GA/YYYY/NNN), read-only
 *  - totalGrantAmount inherited = Σ tranche amounts of the linked fund profile
 *  - reportingAmount  computed = total × FX rate
 *
 * donorId is UX-only (it scopes the fund-profile list); the backend derives the
 * donor from the profile. description and agreementDocumentPath are carried
 * through unchanged from the loaded grant — they are not fields on this form.
 */
export const grantSchema = z
  .object({
    grantCode: z.string().trim().optional().or(z.literal('')),
    donorId: z.string().trim().min(1, 'Donor is required'),
    fundProfileId: z.string().trim().min(1, 'Fund profile is required'),
    programmeId: z.string().trim().min(1, 'Programme is required'),
    agreementName: z.string().trim().min(1, 'Agreement name is required'),
    status: z.enum(['ACTIVE', 'COMPLETED', 'CANCELLED'], { message: 'Status is required' }),
    agreementDate: z.string().min(1, 'Agreement date is required'),
    startDate: z.string().min(1, 'Start date is required'),
    endDate: z.string().min(1, 'End date is required'),
    grantCurrency: z.string().trim().min(1, 'Currency is required'),
    fxLockedRate: z
      .string()
      .trim()
      .min(1, 'FX rate is required')
      .refine((v) => Number(v) > 0, 'FX rate must be positive'),
    // Section 3 — approval status is always one of the four workflow states;
    // the rest of the block is optional until someone actually approves.
    approvalStatus: z.enum(['1', '2', '3', '4'], { message: 'Approval status is required' }),
    approvedBy: z.string().trim().optional().or(z.literal('')),
    approvalDate: z.string().optional().or(z.literal('')),
    approvalRemarks: z.string().trim().optional().or(z.literal('')),
    description: z.string().trim().optional().or(z.literal('')),
    agreementDocumentPath: z.string().trim().optional().or(z.literal('')),
  })
  .refine((values) => !values.startDate || !values.endDate || values.endDate >= values.startDate, {
    message: 'End date cannot be before start date',
    path: ['endDate'],
  })
  // An approved grant needs to say who approved it and when, otherwise the
  // approval is unauditable.
  .refine((values) => values.approvalStatus !== '1' || Boolean(values.approvedBy), {
    message: 'Approved by is required once the grant is approved',
    path: ['approvedBy'],
  })
  .refine((values) => values.approvalStatus !== '1' || Boolean(values.approvalDate), {
    message: 'Approval date is required once the grant is approved',
    path: ['approvalDate'],
  });

export const grantFormDefaults = {
  grantCode: '',
  donorId: '',
  fundProfileId: '',
  programmeId: '',
  agreementName: '',
  status: 'ACTIVE',
  agreementDate: '',
  startDate: '',
  endDate: '',
  grantCurrency: 'INR',
  fxLockedRate: '1',
  approvalStatus: '2',
  approvedBy: '',
  approvalDate: '',
  approvalRemarks: '',
  description: '',
  agreementDocumentPath: '',
};
