import { z } from 'zod';
import { isHumanActioned } from '../mappers/disbursementMapper.js';

const optionalPercent = z
  .union([z.string(), z.number()])
  .optional()
  .refine(
    (v) => v === '' || v === undefined || v === null || (Number(v) >= 0 && Number(v) <= 100),
    { message: 'Must be between 0 and 100' },
  );

const isBlank = (v) => v === undefined || v === null || String(v).trim() === '';

/** One release criterion — mirrors the required fields CriterionFields shows per type. */
const criterionSchema = z
  .object({
    id: z.union([z.string(), z.number()]).nullish(),
    criterionType: z.string().min(1, 'Criterion type is required'),
    releaseDate: z.string().optional(),
    milestoneName: z.string().optional(),
    verificationRole: z.string().optional(),
    otherVerificationRole: z.string().optional(),
    targetDate: z.string().optional(),
    utilisationPercent: z.union([z.string(), z.number()]).optional(),
    triggerBasis: z.string().optional(),
    description: z.string().optional(),
    hasReminder: z.boolean().optional(),
    reminder: z
      .object({
        responsibleRole: z.string().optional(),
        otherResponsibleRole: z.string().optional(),
        reminderLeadDays: z.union([z.string(), z.number()]).optional(),
        repeatReminder: z.string().optional(),
        escalateToDeputy: z.boolean().optional(),
      })
      .optional(),
  })
  .superRefine((c, ctx) => {
    switch (c.criterionType) {
      case 'FIXED_DATE':
        if (isBlank(c.releaseDate)) {
          ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'Release date is required', path: ['releaseDate'] });
        }
        break;
      case 'MILESTONE_BASED':
        if (isBlank(c.milestoneName)) {
          ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'Milestone name is required', path: ['milestoneName'] });
        }
        if (isBlank(c.verificationRole)) {
          ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'Verification role is required', path: ['verificationRole'] });
        } else if (c.verificationRole === 'OTHER' && isBlank(c.otherVerificationRole)) {
          ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'Custom verification role is required', path: ['otherVerificationRole'] });
        }
        break;
      case 'UTILISATION_THRESHOLD':
        if (isBlank(c.utilisationPercent)) {
          ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'Utilisation % is required', path: ['utilisationPercent'] });
        }
        if (isBlank(c.triggerBasis)) {
          ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'Trigger basis is required', path: ['triggerBasis'] });
        }
        break;
      case 'OTHER':
        if (isBlank(c.description)) {
          ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'Description is required', path: ['description'] });
        }
        break;
      default:
        break;
    }

    if (c.hasReminder) {
      if (!isHumanActioned(c.criterionType)) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'A reminder cannot be set on this criterion type',
          path: ['hasReminder'],
        });
      }
      if (isBlank(c.reminder?.responsibleRole)) {
        ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'Responsible role is required', path: ['reminder', 'responsibleRole'] });
      } else if (c.reminder.responsibleRole === 'OTHER' && isBlank(c.reminder.otherResponsibleRole)) {
        ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'Custom responsible role is required', path: ['reminder', 'otherResponsibleRole'] });
      }
      if (isBlank(c.reminder?.reminderLeadDays)) {
        ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'Reminder lead time is required', path: ['reminder', 'reminderLeadDays'] });
      }
    }
  });

const trancheSchema = z.object({
  trancheName: z.string().optional(),
  amount: z
    .union([z.string(), z.number()])
    .refine((v) => v !== '' && v !== null && v !== undefined && Number(v) > 0, {
      message: 'Amount must be positive',
    }),
  expectedReleaseDate: z.string().optional(),
  isFinal: z.boolean().optional(),
  criteria: z.array(criterionSchema).min(1, 'A tranche needs a release criterion'),
});

export const fundProfileSchema = z
  .object({
    fundMode: z.enum(['RESTRICTED', 'UNRESTRICTED'], { message: 'Fund mode is required' }),
    fundClass: z.enum(['', 'CLASS_A_RESTRICTED', 'CLASS_B_UNRESTRICTED', 'CLASS_C_UNRESTRICTED']).optional(),
    purpose: z.string().max(2000).optional(),
    programmeTied: z.boolean().optional(),
    programmeId: z.union([z.string(), z.number()]).optional(),
    reportingFrequency: z.enum(['', 'QUARTERLY', 'HALF_YEARLY', 'ANNUAL']).optional(),
    movementAllowed: z.boolean().optional(),
    explanationRequired: z.boolean().optional(),
    onboardingComplete: z.boolean().optional(),
    selectedGeographies: z.array(z.union([z.string(), z.number()])).optional(),
    utilisationRules: z
      .array(
        z
          .object({
            ruleType: z.string().min(1, 'Rule type is required'),
            otherRuleType: z.string().optional(),
            limitPercentage: optionalPercent,
            description: z.string().optional(),
          })
          .superRefine((rule, ctx) => {
            if (rule.ruleType && rule.ruleType !== 'NOT_APPLICABLE' && isBlank(rule.limitPercentage)) {
              ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'Limit % is required', path: ['limitPercentage'] });
            }
            if (rule.ruleType === 'OTHER_CUSTOM' && isBlank(rule.otherRuleType)) {
              ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'Custom rule type is required', path: ['otherRuleType'] });
            }
          }),
      )
      .optional(),
    // Disbursement Schedule — optional as a whole (the card may be left
    // closed/unfilled); once totalAmount or a tranche is entered, the rest of
    // the section's shape rules kick in, mirroring the backend FundProfileValidator.
    disbursementType: z.enum(['LUMP_SUM', 'TRANCHES']).optional(),
    totalAmount: z.union([z.string(), z.number()]).optional(),
    frequency: z.enum(['MONTHLY', 'QUARTERLY', 'HALF_YEARLY', 'YEARLY']).optional(),
    receivingDate: z.string().optional(),
    tranches: z.array(trancheSchema).optional(),
  })
  .superRefine((data, ctx) => {
    if (data.programmeTied && isBlank(data.programmeId)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Programme is required when Programme-tied is enabled',
        path: ['programmeId'],
      });
    }

    if (data.movementAllowed && !data.programmeTied && isBlank(data.purpose)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Purpose is required when Movement allowed is enabled and Programme-tied is off',
        path: ['purpose'],
      });
    }

    const disbursementActive = !isBlank(data.totalAmount) || (data.tranches || []).length > 0;
    if (!disbursementActive) {
      return;
    }

    if (isBlank(data.totalAmount)) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'Total amount committed is required', path: ['totalAmount'] });
    }

    if (data.disbursementType === 'LUMP_SUM') {
      if (isBlank(data.receivingDate)) {
        ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'Receiving date is required for a lump sum', path: ['receivingDate'] });
      }
    } else if (data.disbursementType === 'TRANCHES') {
      if (isBlank(data.frequency)) {
        ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'Schedule type is required for tranches', path: ['frequency'] });
      }
    }
  });

export const fundProfileFormDefaults = {
  fundMode: 'RESTRICTED',
  fundClass: '',
  purpose: '',
  programmeTied: false,
  programmeId: '',
  reportingFrequency: '',
  movementAllowed: false,
  explanationRequired: false,
  onboardingComplete: false,
  selectedGeographies: [],
  utilisationRules: [],
  disbursementType: 'LUMP_SUM',
  totalAmount: '',
  frequency: 'QUARTERLY',
  receivingDate: '',
  tranches: [],
};
