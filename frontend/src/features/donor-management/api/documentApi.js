import { http } from '../../../lib/api/apiClient.js';

/**
 * Repository for /api/v1/documents (DocumentController).
 * Upload is metadata-only (JSON body with a documentPath), mirroring
 * UploadDocumentRequest — the backend has no multipart endpoint today.
 */
export const documentApi = {
  /** POST /api/v1/documents — body: UploadDocumentRequest → DocumentResponse (201). */
  upload: (payload) => http.post('/v1/documents', payload),

  /** GET /api/v1/documents/{id} → DocumentResponse. */
  getById: (id) => http.get(`/v1/documents/${id}`),

  /** GET /api/v1/documents?grantId=&documentName= → DocumentResponse[]. */
  listByGrant: (grantId, documentName) =>
    http.get('/v1/documents', {
      params: documentName ? { grantId, documentName } : { grantId },
    }),

  /** DELETE /api/v1/documents/{id} → 204. */
  remove: (id) => http.delete(`/v1/documents/${id}`),
};
