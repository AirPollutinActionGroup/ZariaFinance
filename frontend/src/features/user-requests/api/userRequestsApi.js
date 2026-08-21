import { http } from '../../../lib/api/apiClient.js';

/**
 * Repository for /api/v1/user-registrations (UserRegisterNewController) —
 * read/approve/reject side. Registration itself lives in
 * features/registration/api/userRegisterNewApi.js.
 */
export const userRequestsApi = {
  /** GET /api/v1/user-registrations → UserRegisterResponse[]. */
  list: () => http.get('/v1/user-registrations'),

  /** GET /api/v1/user-registrations/{id} → UserRegisterResponse. */
  getById: (id) => http.get(`/v1/user-registrations/${id}`),

  /** PATCH /api/v1/user-registrations/{id}/approve → UserRegisterResponse. */
  approve: (id) => http.patch(`/v1/user-registrations/${id}/approve`),

  /** PATCH /api/v1/user-registrations/{id}/reject → UserRegisterResponse. */
  reject: (id) => http.patch(`/v1/user-registrations/${id}/reject`),
};
