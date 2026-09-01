import { http } from '../../../lib/api/apiClient.js';

/**
 * Repository for /api/v1/employees (EmployeeController).
 * One function per backend endpoint — nothing more, nothing invented.
 */
export const employeeApi = {
  /** POST /api/v1/employees — body: CreateEmployeeRequest → EmployeeResponse (201). */
  create: (payload) => http.post('/v1/employees', payload),

  /** GET /api/v1/employees/{id} → EmployeeResponse. */
  getById: (id) => http.get(`/v1/employees/${id}`),

  /** GET /api/v1/employees[?search=] → EmployeeResponse[]. */
  list: (search) => http.get('/v1/employees', { params: search ? { search } : undefined }),

  /** PATCH /api/v1/employees/{id}/status — body: { status } → 204. */
  updateStatus: (id, status) => http.patch(`/v1/employees/${id}/status`, { status }),
};
