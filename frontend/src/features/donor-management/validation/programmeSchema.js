import { z } from 'zod';
import { PROGRAMME_STATUSES, PROGRAMME_TYPES } from '../constants.js';

/** Select option values come back as numbers (from the API) or strings (typed manually). */
const idValue = z.union([z.string(), z.number()]);

/**
 * Mirrors CreateProgrammeRequest bean validation — programmeCode is not
 * collected here (the backend assigns it automatically as the next
 * PROG-NNN).
 */
export const programmeSchema = z
  .object({
    type: z.enum(PROGRAMME_TYPES).default('Programme'),
    parentProgrammeId: idValue.optional().or(z.literal('')),
    programmeName: z
      .string()
      .trim()
      .min(1, 'Programme name is required')
      .max(255, 'Programme name must be at most 255 characters'),
    description: z.string().optional().or(z.literal('')),
    startDate: z.string().optional().or(z.literal('')),
    endDate: z.string().optional().or(z.literal('')),
    stateIds: z.array(idValue).optional(),
    cityIds: z.array(idValue).optional(),
    status: z.enum(PROGRAMME_STATUSES).default('Active'),
  })
  .refine((data) => data.type !== 'Project' || Boolean(data.parentProgrammeId), {
    message: 'Parent programme is required for a project',
    path: ['parentProgrammeId'],
  })
  .refine((data) => !data.startDate || !data.endDate || data.endDate >= data.startDate, {
    message: 'End date cannot be before start date',
    path: ['endDate'],
  });

export const programmeFormDefaults = {
  type: 'Programme',
  parentProgrammeId: '',
  programmeName: '',
  description: '',
  startDate: '',
  endDate: '',
  stateIds: [],
  cityIds: [],
  status: 'Active',
};
