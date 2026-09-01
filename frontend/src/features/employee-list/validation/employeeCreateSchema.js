import { z } from 'zod';
import { EMPLOYEE_STATUSES } from '../constants.js';

export const employeeCreateSchema = z.object({
  empId: z.string().min(2, 'Employee ID is required'),
  name: z.string().min(2, 'Employee name is required'),
  departmentId: z.union([z.string(), z.number()]).refine((val) => val !== '' && val != null, 'Department is required'),
  designationId: z.union([z.string(), z.number()]).refine((val) => val !== '' && val != null, 'Designation is required'),
  bucket: z.string().min(1, 'Bucket is required'),
  primaryProgrammeIds: z.array(z.union([z.string(), z.number()])).optional(),
  stateIds: z.array(z.union([z.string(), z.number()])).min(1, 'At least one state is required'),
  cityIds: z.array(z.union([z.string(), z.number()])).optional(),
  joiningDate: z.string().min(1, 'Joining date is required'),
  exitDate: z.string().optional(),
  annualCtc: z
    .string()
    .min(1, 'Annual CTC is required')
    .refine((val) => !isNaN(Number(val.replace(/,/g, ''))), 'Annual CTC must be a valid number'),
  employmentType: z.enum(['Permanent', 'Contract'], {
    errorMap: () => ({ message: 'Employment type is required' }),
  }),
  status: z.enum(EMPLOYEE_STATUSES).default('Active'),
  pf: z.enum(['Yes', 'No']),
  esi: z.enum(['Yes', 'No']),
  gratuity: z.enum(['Yes', 'No']),
});

export const employeeCreateDefaults = {
  empId: '',
  name: '',
  departmentId: '',
  designationId: '',
  bucket: 'Admin',
  primaryProgrammeIds: [],
  stateIds: [],
  cityIds: [],
  joiningDate: '',
  exitDate: '',
  annualCtc: '',
  employmentType: 'Permanent',
  status: 'Active',
  pf: 'Yes',
  esi: 'No',
  gratuity: 'Yes',
};
