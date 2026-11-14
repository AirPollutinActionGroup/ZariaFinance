import { z } from 'zod';
import { EMPLOYEE_STATUSES } from '../constants.js';

const PAN_REGEX = /^[A-Z]{5}[0-9]{4}[A-Z]$/;
const IFSC_REGEX = /^[A-Z]{4}0[A-Z0-9]{6}$/;

export const employeeCreateSchema = z.object({
  empId: z.string().min(2, 'Employee ID is required'),
  name: z.string().min(2, 'Employee name is required'),
  departmentId: z.union([z.string(), z.number()]).refine((val) => val !== '' && val != null, 'Department is required'),
  designationId: z.union([z.string(), z.number()]).refine((val) => val !== '' && val != null, 'Designation is required'),
  bucket: z.string().min(1, 'Bucket is required'),
  stateId: z.union([z.string(), z.number()]).refine((val) => val !== '' && val != null, 'State is required'),
  cityId: z.union([z.string(), z.number()]).optional(),
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
  remark: z.string().optional(),

  // Banking, PAN and documents — frontend only for now (not sent to the backend yet).
  accountHolderName: z.string().optional(),
  bankName: z.string().optional(),
  accountType: z.string().optional(),
  accountNumber: z
    .string()
    .optional()
    .refine((val) => !val || /^\d{9,18}$/.test(val), 'Account number must be 9 to 18 digits'),
  ifscCode: z
    .string()
    .optional()
    .refine((val) => !val || IFSC_REGEX.test(val), 'Enter a valid IFSC code (e.g. HDFC0000123)'),
  branchName: z.string().optional(),
  panNumber: z
    .string()
    .optional()
    .refine((val) => !val || PAN_REGEX.test(val), 'Enter a valid PAN (e.g. ABCDE1234F)'),
  panCardFile: z.any().optional(),
  aadhaarCardFile: z.any().optional(),
});

export const employeeCreateDefaults = {
  empId: '',
  name: '',
  departmentId: '',
  designationId: '',
  bucket: 'Admin',
  stateId: '',
  cityId: '',
  joiningDate: '',
  exitDate: '',
  annualCtc: '',
  employmentType: 'Permanent',
  status: 'Active',
  pf: 'Yes',
  esi: 'No',
  gratuity: 'Yes',
  remark: '',
  accountHolderName: '',
  bankName: '',
  accountType: '',
  accountNumber: '',
  ifscCode: '',
  branchName: '',
  panNumber: '',
  panCardFile: null,
  aadhaarCardFile: null,
};
