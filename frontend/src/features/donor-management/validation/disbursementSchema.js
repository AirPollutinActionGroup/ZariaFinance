import { z } from 'zod';

/**
 * Mirrors DisbursementScheduleRequest and @ValidDisbursementSchedule: the
 * lump-sum / tranches shape, and the mandatory "Additional Fields" of each
 * criterion type (Disbursement Rules §1, §4, §5).
 *
 * Criteria are validated with superRefine rather than a discriminated union so
 * that switching type keeps whatever the user already typed — a union would
 * reject the stale fields instead of ignoring them. The mapper strips fields
 * that do not belong to the chosen type before sending.
 */

const reminderSchema = z.object({
  responsibleRole: z.string().optional().or(z.literal('')),
  reminderLeadDays: z.union([z.string(), z.number()]).optional(),
  repeatReminder: z.enum(['ONCE', 'EVERY_3_DAYS', 'WEEKLY']).optional(),
  escalateToDeputy: z.boolean().optional(),
});

const criterionSchema = z.object({
  id: z.union([z.number(), z.null()]).optional(),
  criterionType: z.enum([
    'ON_SIGNING',
    'FIXED_DATE',
    'MILESTONE_BASED',
    'UTILISATION_THRESHOLD',
    'UTILISATION_CERTIFICATE',
    'FINANCIAL_REPORT',
    'NARRATIVE_REPORT',
    'AUDIT_REPORT',
    'DONOR_APPROVAL',
    'OTHER',
  ]),
  releaseDate: z.string().optional().or(z.literal('')),
  milestoneName: z.string().optional().or(z.literal('')),
  verificationRole: z.string().optional().or(z.literal('')),
  targetDate: z.string().optional().or(z.literal('')),
  utilisationPercent: z.union([z.string(), z.number()]).optional(),
  triggerBasis: z.string().optional().or(z.literal('')),
  description: z.string().optional().or(z.literal('')),
  met: z.boolean().optional(),
  hasReminder: z.boolean().optional(),
  reminder: reminderSchema.optional(),
});

const trancheSchema = z.object({
  id: z.union([z.number(), z.null()]).optional(),
  trancheName: z.string().optional().or(z.literal('')),
  amount: z
    .union([z.string(), z.number()])
    .refine((v) => v !== '' && v !== null && v !== undefined && Number(v) > 0, {
      message: 'Amount must be positive',
    }),
  expectedReleaseDate: z.string().optional().or(z.literal('')),
  received: z.boolean().optional(),
  criteria: z.array(criterionSchema).min(1, 'Add at least one release criterion'),
});

/** Per-type mandatory fields, reported on the offending field. */
function checkCriterion(criterion, ctx, path) {
  const at = (field) => [...path, field];
  const blank = (v) => v === undefined || v === null || String(v).trim() === '';

  switch (criterion.criterionType) {
    case 'FIXED_DATE':
      if (blank(criterion.releaseDate)) {
        ctx.addIssue({ code: 'custom', path: at('releaseDate'), message: 'Release date is required' });
      }
      break;
    case 'MILESTONE_BASED':
      if (blank(criterion.milestoneName)) {
        ctx.addIssue({ code: 'custom', path: at('milestoneName'), message: 'Milestone name is required' });
      }
      if (blank(criterion.verificationRole)) {
        ctx.addIssue({
          code: 'custom',
          path: at('verificationRole'),
          message: 'Verification sign-off role is required',
        });
      }
      break;
    case 'UTILISATION_THRESHOLD':
      if (blank(criterion.utilisationPercent) || Number(criterion.utilisationPercent) <= 0
          || Number(criterion.utilisationPercent) > 100) {
        ctx.addIssue({
          code: 'custom',
          path: at('utilisationPercent'),
          message: 'Utilisation % must be between 1 and 100',
        });
      }
      if (blank(criterion.triggerBasis)) {
        ctx.addIssue({ code: 'custom', path: at('triggerBasis'), message: 'Trigger basis is required' });
      }
      break;
    case 'OTHER':
      if (blank(criterion.description)) {
        ctx.addIssue({ code: 'custom', path: at('description'), message: 'Description is required' });
      }
      break;
    default:
      break;
  }

  // Reminder fields are only mandatory once a reminder is switched on.
  if (criterion.hasReminder) {
    if (blank(criterion.reminder?.responsibleRole)) {
      ctx.addIssue({
        code: 'custom',
        path: [...path, 'reminder', 'responsibleRole'],
        message: 'Responsible role is required',
      });
    }
    if (blank(criterion.reminder?.reminderLeadDays) || Number(criterion.reminder.reminderLeadDays) < 0) {
      ctx.addIssue({
        code: 'custom',
        path: [...path, 'reminder', 'reminderLeadDays'],
        message: 'Reminder lead time is required',
      });
    }
  }
}

export const disbursementSchema = z
  .object({
    disbursementType: z.enum(['LUMP_SUM', 'TRANCHES'], { message: 'Disbursement type is required' }),
    receivingDate: z.string().optional().or(z.literal('')),
    scheduleType: z.string().optional().or(z.literal('')),
    tranches: z.array(trancheSchema),
  })
  .superRefine((values, ctx) => {
    if (values.disbursementType === 'LUMP_SUM') {
      if (!values.receivingDate) {
        ctx.addIssue({ code: 'custom', path: ['receivingDate'], message: 'Receiving date is required' });
      }
    } else {
      if (!values.scheduleType) {
        ctx.addIssue({ code: 'custom', path: ['scheduleType'], message: 'Schedule type is required' });
      }
      // Saving with no tranches is a valid draft — pick the cadence, save, then add
      // tranches or copy the fund profile's plan. Finalising is what requires them.
    }

    (values.tranches || []).forEach((tranche, t) => {
      (tranche.criteria || []).forEach((criterion, c) => {
        checkCriterion(criterion, ctx, ['tranches', t, 'criteria', c]);
      });
    });
  });

export const disbursementFormDefaults = {
  disbursementType: 'TRANCHES',
  receivingDate: '',
  scheduleType: '',
  tranches: [],
};
