import { z } from 'zod';

/**
 * Mirrors AddUserRegisterDto bean validation:
 * firstName @NotBlank; emailId @Email @NotBlank; mobileNo ^[6-9]\d{9}$;
 * username 4–20 chars; password 8–100 chars.
 */
export const registerSchema = z
  .object({
    firstName: z.string().trim().min(1, 'First name is required'),
    lastName: z.string().trim().optional().or(z.literal('')),
    emailId: z.string().trim().min(1, 'Email is required').email('Invalid email'),
    mobileNo: z
      .string()
      .trim()
      .regex(/^[6-9]\d{9}$/, 'Invalid mobile number'),
    username: z
      .string()
      .trim()
      .min(4, 'Username must be between 4 and 20 characters')
      .max(20, 'Username must be between 4 and 20 characters'),
    password: z
      .string()
      .min(8, 'Password must be between 8 and 100 characters')
      .max(100, 'Password must be between 8 and 100 characters'),
    confirmPassword: z.string(),
  })
  .refine((values) => values.password === values.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  });

export const registerFormDefaults = {
  firstName: '',
  lastName: '',
  emailId: '',
  mobileNo: '',
  username: '',
  password: '',
  confirmPassword: '',
};
