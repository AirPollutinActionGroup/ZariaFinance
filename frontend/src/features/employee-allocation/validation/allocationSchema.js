import { z } from 'zod';

export const allocationSchema = z
  .object({
    employeeId: z.union([z.string(), z.number()]).refine((val) => val !== '' && val != null, 'Select an employee'),
    programmeId: z.union([z.string(), z.number()]).refine((val) => val !== '' && val != null, 'Select a program'),
    projectId: z.union([z.string(), z.number()]).refine((val) => val !== '' && val != null, 'Select a project'),
    role: z.string().optional(),
    stateIds: z.array(z.union([z.string(), z.number()])).optional(),
    cityIds: z.array(z.union([z.string(), z.number()])).optional(),
    allocationPct: z
      .string()
      .min(1, 'Allocation % is required')
      .refine((val) => !isNaN(Number(val)), 'Must be a number')
      .refine((val) => Number(val) >= 1 && Number(val) <= 100, 'Must be between 1 and 100'),
    startDate: z.string().optional(),
    endDate: z.string().optional(),
    remark: z.string().optional(),
  })
  .refine((data) => !data.startDate || !data.endDate || data.endDate >= data.startDate, {
    message: 'End date cannot be before start date',
    path: ['endDate'],
  });

export const allocationFormDefaults = {
  employeeId: '',
  programmeId: '',
  projectId: '',
  role: '',
  stateIds: [],
  cityIds: [],
  allocationPct: '',
  startDate: '',
  endDate: '',
  remark: '',
};
