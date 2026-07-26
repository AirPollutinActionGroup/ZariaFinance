import { http } from '../../../lib/api/apiClient.js';

/**
 * Repository for /api/v1/role-directory (RoleDirectoryController) — who holds
 * each organisational role, used to resolve reminder recipients.
 */
export const roleDirectoryApi = {
  /** GET → RoleDirectoryEntryDto[]. */
  list: () => http.get('/v1/role-directory'),

  /** PUT — assigns holders and deputies; unmentioned roles are untouched. */
  save: (entries) => http.put('/v1/role-directory', entries),
};
