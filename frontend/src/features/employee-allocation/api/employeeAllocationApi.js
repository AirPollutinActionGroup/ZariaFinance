import { http } from '../../../lib/api/apiClient.js';

/**
 * Repository for /api/v1/employee-allocations (EmployeeAllocationController).
 * One function per backend endpoint — nothing more, nothing invented.
 */
export const employeeAllocationApi = {
  /** GET /api/v1/employee-allocations → EmployeeAllocationResponse[] (each with `active`). */
  list: () => http.get('/v1/employee-allocations'),

  /** POST /api/v1/employee-allocations — body: CreateEmployeeAllocationRequest → EmployeeAllocationResponse (201). */
  create: (payload) => http.post('/v1/employee-allocations', payload),

  /** PATCH /api/v1/employee-allocations/{id}/end — body: { endDate?, note? } → EmployeeAllocationResponse. */
  end: (id, payload) => http.patch(`/v1/employee-allocations/${id}/end`, payload),

  /** DELETE /api/v1/employee-allocations/{id}[?note=] → 204. The removal is kept in the history. */
  remove: (id, note) => http.delete(`/v1/employee-allocations/${id}`, { params: note ? { note } : undefined }),

  /** GET /api/v1/employee-allocations/history?employeeId= → EmployeeAllocationLogResponse[] (newest first). */
  history: (employeeId) => http.get('/v1/employee-allocations/history', { params: { employeeId } }),
};
