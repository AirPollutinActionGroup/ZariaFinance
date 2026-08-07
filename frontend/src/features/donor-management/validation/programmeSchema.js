import { z } from 'zod';

/**
 * Mirrors CreateProgrammeRequest bean validation. programmeCode is not
 * collected here — the backend assigns it automatically (next PROG-NNN).
 */
export const programmeSchema = z.object({
  programmeName: z
    .string()
    .trim()
    .min(1, 'Programme name is required')
    .max(255, 'Programme name must be at most 255 characters'),
  description: z.string().optional().or(z.literal('')),
  isActive: z.boolean().optional(),
});

export const programmeFormDefaults = {
  programmeName: '',
  description: '',
  isActive: true,
};
