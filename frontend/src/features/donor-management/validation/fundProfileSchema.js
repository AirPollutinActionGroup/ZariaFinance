import { z } from 'zod';
import { isCriterionHumanActioned } from '../constants.js';

const optionalPercent = z
  .union([z.string(), z.number()])
  .optional()
  .refine(
    (v) => v === '' || v === undefined || v === null || (Number(v) >= 0 && Number(v) <= 100),
    { message: 'Must be between 0 and 100' },
  );

const positiveAmount = z
  .union([z.string(), z.number()])
  .refine((v) => v !== '' && v !== null && v !== undefined && Number(v) > 0, {
    message: 'Amount must be positive',
  });

/** Same conditional-field shape as a grant-level criterion, but one per tranche row. */
const trancheSchema = z
  .object({
    trancheName: z.string().optional(),
    amount: positiveAmount,
    isFinalTranche: z.boolean().optional(),
    releaseCriteria: z.string().min(1, 'Release criterion is required'),
    releaseDate: z.string().optional(),
    milestoneName: z.string().optional(),
    signOfRole: z.string().optional(),
    otherSignOfRole: z.string().optional(),
    targetDate: z.string().optional(),
    utilisationPercentage: optionalPercent,
    triggerBase: z.string().optional(),
    description: z.string().optional(),
    hasReminder: z.boolean().optional(),
    responsibleRole: z.string().optional(),
    otherResponsibleRole: z.string().optional(),
    reminderLeadTime: z.union([z.string(), z.number()]).optional(),
    repeatReminder: z.string().optional(),
    escalateToDeputy: z.boolean().optional(),
  })
  .superRefine((t, ctx) => {
    if (t.releaseCriteria === 'FIXED_DATE' && !t.releaseDate) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'Release date is required', path: ['releaseDate'] });
    }
    if (t.releaseCriteria === 'MILESTONE_BASED') {
      if (!t.milestoneName) {
        ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'Milestone name is required', path: ['milestoneName'] });
      }
      if (!t.signOfRole) {
        ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'Sign-off role is required', path: ['signOfRole'] });
      }
      if (t.signOfRole === 'OTHER' && !t.otherSignOfRole) {
        ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'Specify the sign-off role', path: ['otherSignOfRole'] });
      }
    }
    if (t.releaseCriteria === 'UTILISATION_THRESHOLD') {
      if (t.utilisationPercentage === '' || t.utilisationPercentage === undefined || t.utilisationPercentage === null) {
        ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'Utilisation % is required', path: ['utilisationPercentage'] });
      }
      if (!t.triggerBase) {
        ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'Trigger basis is required', path: ['triggerBase'] });
      }
    }
    if (t.releaseCriteria === 'OTHER' && !t.description) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'Description is required', path: ['description'] });
    }
    if (t.hasReminder && isCriterionHumanActioned(t.releaseCriteria)) {
      if (!t.responsibleRole) {
        ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'Responsible role is required', path: ['responsibleRole'] });
      }
      if (t.responsibleRole === 'OTHER' && !t.otherResponsibleRole) {
        ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'Specify the responsible role', path: ['otherResponsibleRole'] });
      }
      if (t.reminderLeadTime === '' || t.reminderLeadTime === undefined || t.reminderLeadTime === null) {
        ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'Reminder lead time is required', path: ['reminderLeadTime'] });
      }
    }
  });

export const fundProfileSchema = z
  .object({
    fundMode: z.string().min(1, 'Fund mode is required'),
    fundClassCode: z.enum(['', 'A', 'B', 'C']).optional(),
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
            if (
              rule.ruleType &&
              rule.ruleType !== 'NOT_APPLICABLE' &&
              (rule.limitPercentage === '' || rule.limitPercentage === undefined || rule.limitPercentage === null)
            ) {
              ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'Limit % is required', path: ['limitPercentage'] });
            }
            if (rule.ruleType === 'OTHER_CUSTOM' && (!rule.otherRuleType || rule.otherRuleType.trim() === '')) {
              ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'Custom rule type is required', path: ['otherRuleType'] });
            }
          }),
      )
      .optional(),
    // The donor-agreed release schedule for the whole profile. Σ tranche.amount
    // becomes the Total Grant Amount inherited by every grant on this profile.
    disbursementType: z.enum(['LUMP_SUM', 'TRANCHE']).optional(),
    totalAmountCommitted: positiveAmount,
    receivingDate: z.string().optional(),
    scheduleType: z.string().optional(),
    tranches: z.array(trancheSchema).optional(),
  })
  .superRefine((data, ctx) => {
    if (data.programmeTied && (!data.programmeId || data.programmeId === '')) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'Programme is required when Programme-tied is enabled', path: ['programmeId'] });
    }
    if (data.disbursementType === 'LUMP_SUM' && !data.receivingDate) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'Receiving date is required', path: ['receivingDate'] });
    }
    if (data.disbursementType === 'TRANCHE') {
      if (!data.scheduleType) {
        ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'Schedule type is required', path: ['scheduleType'] });
      }
      if (!data.tranches || data.tranches.length === 0) {
        ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'Add at least one tranche', path: ['tranches'] });
      }
    }
  });

export const fundProfileFormDefaults = {
  fundMode: 'Restricted',
  fundClassCode: '',
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
  totalAmountCommitted: '',
  receivingDate: '',
  scheduleType: '',
  tranches: [],
};
