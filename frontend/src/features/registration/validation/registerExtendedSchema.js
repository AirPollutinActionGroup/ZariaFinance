import { z } from 'zod';

/**
 * Extended Registration Schema for User Creation:
 * Includes strict email validation, role select, and organisation select.
 */
export const registerExtendedSchema = z
  .object({
    firstName: z.string().trim().min(1, 'First name is required'),
    lastName: z.string().trim().optional().or(z.literal('')),
    emailId: z
      .string()
      .trim()
      .min(1, 'Email ID is required')
      .email('Invalid email address format (e.g. name@domain.com)'),
    mobileNo: z
      .string()
      .trim()
      .regex(/^[6-9]\d{9}$/, 'Invalid mobile number (10 digits starting 6–9)'),
    username: z
      .string()
      .trim()
      .min(4, 'Username must be between 4 and 20 characters')
      .max(20, 'Username must be between 4 and 20 characters'),
    role: z
      .union([z.string(), z.number()])
      .refine((value) => value !== '' && value != null, 'Please select a role'),
    organisation: z
      .union([z.string(), z.number()])
      .refine((value) => value !== '' && value != null, 'Please select an organisation'),
    password: z
      .string()
      .min(8, 'Password must be between 8 and 100 characters')
      .max(100, 'Password must be between 8 and 100 characters'),
    confirmPassword: z.string().min(1, 'Please confirm your password'),
  })
  .refine((values) => values.password === values.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  });

export const registerExtendedFormDefaults = {
  firstName: '',
  lastName: '',
  emailId: '',
  mobileNo: '',
  username: '',
  role: '',
  organisation: '',
  password: '',
  confirmPassword: '',
};
