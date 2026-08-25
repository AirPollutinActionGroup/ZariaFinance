import { z } from 'zod';

export const employeeCreateSchema = z.object({
  empId: z.string().min(2, 'Employee ID is required'),
  name: z.string().min(2, 'Employee name is required'),
  department: z.string().min(2, 'Department is required'),
  designation: z.string().min(2, 'Designation is required'),
  bucket: z.string().min(1, 'Bucket is required'),
  primaryProgramme: z.string().optional(),
  state: z.string().min(1, 'State is required'),
  annualCtc: z
    .string()
    .min(1, 'Annual CTC is required')
    .refine((val) => !isNaN(Number(val.replace(/,/g, ''))), 'Annual CTC must be a valid number'),
  employmentType: z.enum(['Permanent', 'Contract'], {
    errorMap: () => ({ message: 'Employment type is required' }),
  }),
  status: z.enum(['Active', 'Inactive']).default('Active'),
  pf: z.enum(['Yes', 'No']),
  esi: z.enum(['Yes', 'No']),
  gratuity: z.enum(['Yes', 'No']),
});

export const employeeCreateDefaults = {
  empId: '',
  name: '',
  department: 'DEPT-PROCESS',
  designation: '',
  bucket: 'Admin',
  primaryProgramme: '',
  state: 'Delhi',
  annualCtc: '',
  employmentType: 'Permanent',
  status: 'Active',
  pf: 'Yes',
  esi: 'No',
  gratuity: 'Yes',
};
