import { http } from '../../../lib/api/apiClient.js';

/**
 * Repository for /api/v1/document-types (DocumentTypeController).
 * One function per backend endpoint — nothing more, nothing invented.
 */
export const documentTypeApi = {
  /** GET /api/v1/document-types[?search=&activeOnly=] → DocumentTypeResponse[]. */
  list: (search, activeOnly) => {
    const params = {};
    if (search) params.search = search;
    if (activeOnly) params.activeOnly = true;
    return http.get('/v1/document-types', { params });
  },

  /** POST /api/v1/document-types — body: { name, code?, status? } → DocumentTypeResponse (201). */
  create: (payload) => http.post('/v1/document-types', payload),

  /** PUT /api/v1/document-types/{id} — body: { name } → DocumentTypeResponse (code never changes). */
  update: (id, payload) => http.put(`/v1/document-types/${id}`, payload),

  /** PATCH /api/v1/document-types/{id}/activate → 204. */
  activate: (id) => http.patch(`/v1/document-types/${id}/activate`),

  /** PATCH /api/v1/document-types/{id}/deactivate → 204. */
  deactivate: (id) => http.patch(`/v1/document-types/${id}/deactivate`),
};
