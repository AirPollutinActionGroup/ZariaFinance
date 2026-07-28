import { z } from 'zod';

const optionalPercent = z
  .union([z.string(), z.number()])
  .optional()
  .refine(
    (v) => v === '' || v === undefined || v === null || (Number(v) >= 0 && Number(v) <= 100),
    { message: 'Must be between 0 and 100' },
  );

export const fundProfileSchema = z.object({
  fundMode: z.string().min(1, 'Fund mode is required'),
  fundClassCode: z.enum(['', 'A', 'B', 'C']).optional(),
  purpose: z.string().max(2000).optional(),
  programmeTied: z.boolean().optional(),
  programmeId: z.union([z.string(), z.number()]).optional(),
  reportingFrequency: z.string().optional(),
  adminAllowed: z.boolean().optional(),
  overheadLimitPercent: optionalPercent,
  movementAllowed: z.boolean().optional(),
  explanationRequired: z.boolean().optional(),
  onboardingComplete: z.boolean().optional(),
  geographies: z
    .array(z.object({ geographyName: z.string().min(1, 'Geography name is required') }))
    .optional(),
  selectedGeographies: z.array(z.string()).optional(),
  utilisationRules: z
    .array(
      z
        .object({
          ruleType: z.string().min(1, 'Rule type is required'),
          customRuleType: z.string().optional(),
          limitPercentage: optionalPercent,
          description: z.string().optional(),
        })
        .superRefine((rule, ctx) => {
          if (
            rule.ruleType &&
            rule.ruleType !== 'NOT_APPLICABLE' &&
            (rule.limitPercentage === '' || rule.limitPercentage === undefined || rule.limitPercentage === null)
          ) {
            ctx.addIssue({
              code: z.ZodIssueCode.custom,
              message: 'Limit % is required',
              path: ['limitPercentage'],
            });
          }
          if (rule.ruleType === 'OTHER' && (!rule.customRuleType || rule.customRuleType.trim() === '')) {
            ctx.addIssue({
              code: z.ZodIssueCode.custom,
              message: 'Custom rule type is required',
              path: ['customRuleType'],
            });
          }
        }),
    )
    .optional(),
  disbursementRules: z
    .array(
      z.object({
        ruleType: z.string().min(1, 'Rule type is required'),
        releaseTrigger: z.string().optional(),
        minPriorUtilisationRequired: optionalPercent,
        milestoneRequired: z.boolean().optional(),
        ruleDescription: z.string().optional(),
      }),
    )
    .optional(),
  // The donor-agreed release schedule. Σ trancheAmount is the Total Grant Amount
  // inherited by every grant on this profile, so amounts must be real positives.
  tranches: z
    .array(
      z.object({
        trancheName: z.string().optional(),
        trancheAmount: z
          .union([z.string(), z.number()])
          .refine((v) => v !== '' && v !== null && v !== undefined && Number(v) > 0, {
            message: 'Tranche amount must be positive',
          }),
        plannedReleaseDate: z.string().optional(),
      }),
    )
    .optional(),
}).superRefine((data, ctx) => {
  if (data.programmeTied && (!data.programmeId || data.programmeId === '')) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: 'Programme is required when Programme-tied is enabled',
      path: ['programmeId'],
    });
  }
});

export const fundProfileFormDefaults = {
  fundMode: 'Restricted',
  fundClassCode: '',
  purpose: '',
  programmeTied: false,
  programmeId: '',
  reportingFrequency: '',
  adminAllowed: true,
  overheadLimitPercent: '',
  movementAllowed: false,
  explanationRequired: false,
  onboardingComplete: false,
  geographies: [],
  selectedGeographies: [],
  utilisationRules: [],
  disbursementRules: [],
  tranches: [],
};
