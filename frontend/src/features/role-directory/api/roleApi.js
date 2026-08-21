import { http } from '../../../lib/api/apiClient.js';

/**
 * Repository for /api/v1/roles (RoleMasterController).
 * One function per backend endpoint — nothing more, nothing invented.
 */
export const roleApi = {
  /** POST /api/v1/roles — body: CreateRoleRequest → RoleResponse (201). */
  create: (payload) => http.post('/v1/roles', payload),

  /** GET /api/v1/roles/{id} → RoleResponse. */
  getById: (id) => http.get(`/v1/roles/${id}`),

  /** GET /api/v1/roles[?search=] → RoleResponse[]. */
  list: (search) => http.get('/v1/roles', { params: search ? { search } : undefined }),

  /** GET /api/v1/roles/verify-short-name?shortName= → { shortName, exists }. */
  verifyShortName: (shortName) =>
    http.get('/v1/roles/verify-short-name', { params: { shortName } }),

  /** PUT /api/v1/roles/{id} — body: UpdateRoleRequest → RoleResponse. */
  update: (id, payload) => http.put(`/v1/roles/${id}`, payload),

  /** PATCH /api/v1/roles/{id}/activate → 204. */
  activate: (id) => http.patch(`/v1/roles/${id}/activate`),

  /** PATCH /api/v1/roles/{id}/deactivate → 204. */
  deactivate: (id) => http.patch(`/v1/roles/${id}/deactivate`),

  /** GET /api/v1/roles/{id}/users → RoleUserResponse[]. */
  getAssignedUsers: (id) => http.get(`/v1/roles/${id}/users`),

  /** POST /api/v1/roles/{id}/users — body: { userId } → RoleUserResponse (201). */
  assignUser: (id, userId) => http.post(`/v1/roles/${id}/users`, { userId }),

  /** DELETE /api/v1/roles/{id}/users/{userId} → 204. */
  unassignUser: (id, userId) => http.delete(`/v1/roles/${id}/users/${userId}`),
};
