import { http } from '../../../lib/api/apiClient.js';

/**
 * Repository for /api/v1/departments (DepartmentController).
 * One function per backend endpoint — nothing more, nothing invented.
 */
export const departmentApi = {
  /** POST /api/v1/departments — body: CreateDepartmentRequest → DepartmentResponse (201). */
  create: (payload) => http.post('/v1/departments', payload),

  /** GET /api/v1/departments/{id} → DepartmentResponse. */
  getById: (id) => http.get(`/v1/departments/${id}`),

  /** GET /api/v1/departments[?search=] → DepartmentResponse[]. */
  list: (search) => http.get('/v1/departments', { params: search ? { search } : undefined }),

  /** PUT /api/v1/departments/{id} — body: UpdateDepartmentRequest → DepartmentResponse. */
  update: (id, payload) => http.put(`/v1/departments/${id}`, payload),

  /** PATCH /api/v1/departments/{id}/activate → 204. */
  activate: (id) => http.patch(`/v1/departments/${id}/activate`),

  /** PATCH /api/v1/departments/{id}/deactivate → 204. */
  deactivate: (id) => http.patch(`/v1/departments/${id}/deactivate`),
};
