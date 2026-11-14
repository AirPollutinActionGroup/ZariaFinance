import { http } from '../../../lib/api/apiClient.js';
import { env } from '../../../lib/config/env.js';

/**
 * Repository for /api/v1/employees (EmployeeController).
 * One function per backend endpoint — nothing more, nothing invented.
 */
export const employeeApi = {
  /** POST /api/v1/employees — body: CreateEmployeeRequest → EmployeeResponse (201). */
  create: (payload) => http.post('/v1/employees', payload),

  /** GET /api/v1/employees/{id} → EmployeeResponse. */
  getById: (id) => http.get(`/v1/employees/${id}`),

  /** PUT /api/v1/employees/{id} — body: UpdateEmployeeRequest → EmployeeResponse. */
  update: (id, payload) => http.put(`/v1/employees/${id}`, payload),

  /** GET /api/v1/employees[?search=] → EmployeeResponse[]. */
  list: (search) => http.get('/v1/employees', { params: search ? { search } : undefined }),

  /** PATCH /api/v1/employees/{id}/status — body: { status } → 204. */
  updateStatus: (id, status) => http.patch(`/v1/employees/${id}/status`, { status }),

  /** GET /api/v1/employees/{id}/update-logs → EmployeeUpdateLogResponse[]. */
  getUpdateLogs: (id) => http.get(`/v1/employees/${id}/update-logs`),

  /** POST /api/v1/employees/{id}/documents/{type} — multipart "file" → EmployeeDocumentResponse. */
  uploadDocument: (id, type, file) => {
    const form = new FormData();
    form.append('file', file);
    return http.post(`/v1/employees/${id}/documents/${type}`, form, {
      headers: { 'Content-Type': 'multipart/form-data' },
      timeout: 120000,
    });
  },

  /** DELETE /api/v1/employees/{id}/documents/{type} → 204. */
  deleteDocument: (id, type) => http.delete(`/v1/employees/${id}/documents/${type}`),

  /** URL of GET /api/v1/employees/{id}/documents/{type} — opened in a new tab to view / download. */
  documentUrl: (id, type) => `${(env.apiBaseUrl || '/api').replace(/\/$/, '')}/v1/employees/${id}/documents/${type}`,
};
