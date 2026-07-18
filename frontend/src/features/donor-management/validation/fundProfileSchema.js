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
  utilisationRules: z
    .array(
      z.object({
        ruleType: z.string().min(1, 'Rule type is required'),
        limitPercentage: optionalPercent,
        description: z.string().optional(),
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
  utilisationRules: [],
  disbursementRules: [],
};
