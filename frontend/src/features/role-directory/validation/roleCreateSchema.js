import { z } from 'zod';

export const ROLE_STATUSES = ['Active', 'Inactive'];

export const roleCreateSchema = z.object({
  roleName: z.string().min(2, 'Role name is required'),
  shortName: z.string().min(1, 'Short name is required'),
  status: z.enum(ROLE_STATUSES, {
    errorMap: () => ({ message: 'Status is required' }),
  }),
});

export const roleCreateDefaults = {
  roleName: '',
  shortName: '',
  status: 'Active',
};
