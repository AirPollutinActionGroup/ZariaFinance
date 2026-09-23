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
 *
 * Every grant reports in INR at par — there is no multi-currency support, so
 * there's no currency or FX rate field here.
 *
 * donorId is UX-only (it scopes the fund-profile list); the backend derives the
 * donor from the profile.
 */
export const grantSchema = z
  .object({
    grantCode: z.string().trim().optional().or(z.literal('')),
    donorId: z.string().trim().min(1, 'Donor is required'),
    fundProfileId: z.string().trim().min(1, 'Fund profile is required'),
    agreementName: z.string().trim().min(1, 'Agreement name is required'),
    agreementDate: z.string().min(1, 'Agreement date is required'),
    startDate: z.string().min(1, 'Start date is required'),
    endDate: z.string().min(1, 'End date is required'),
    // Approval status, approver and date are managed outside this form; they
    // pass through unchanged from whatever was loaded into defaultValues.
    approvalStatus: z.enum(['1', '2', '3', '4']).optional(),
    approvedBy: z.string().trim().optional().or(z.literal('')),
    approvalDate: z.string().optional().or(z.literal('')),
    approvalRemarks: z.string().trim().optional().or(z.literal('')),
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
  status: 'ACTIVE',
  agreementDate: '',
  startDate: '',
  endDate: '',
  approvalStatus: '2',
  approvedBy: '',
  approvalDate: '',
  approvalRemarks: '',
  description: '',
  agreementDocumentPath: '',
};
