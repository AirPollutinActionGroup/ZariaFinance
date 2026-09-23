import { http } from '../../../lib/api/apiClient.js';

/**
 * Repository for /api/v1/employee-allocations (EmployeeAllocationController).
 * One function per backend endpoint — nothing more, nothing invented.
 */
export const employeeAllocationApi = {
  /** GET /api/v1/employee-allocations → EmployeeAllocationResponse[]. */
  list: () => http.get('/v1/employee-allocations'),

  /** POST /api/v1/employee-allocations — body: CreateEmployeeAllocationRequest → EmployeeAllocationResponse (201). */
  create: (payload) => http.post('/v1/employee-allocations', payload),

  /** DELETE /api/v1/employee-allocations/{id} → 204. */
  remove: (id) => http.delete(`/v1/employee-allocations/${id}`),
};
