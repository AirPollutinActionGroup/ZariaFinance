import { z } from 'zod';

export const roleCreateSchema = z.object({
  roleName: z.string().min(2, 'Role name is required'),
  shortName: z.string().min(1, 'Short name is required'),
  userLimit: z.string().min(1, 'User limit is required'),
  permissionRole: z.enum(['CEO', 'FINANCE_OFFICER', 'FUNDRAISING_LEAD'], {
    errorMap: () => ({ message: 'Permission role is required' }),
  }),
});

export const roleCreateDefaults = {
  roleName: '',
  shortName: '',
  userLimit: '',
  permissionRole: '',
};
