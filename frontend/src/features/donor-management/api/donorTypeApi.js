import { http } from '../../../lib/api/apiClient.js';

/**
 * Repository for /api/v1/donor-types (DonorTypeController) — read-only from
 * the donor form's point of view. Donor types are managed under Master
 * Configuration (see features/masters).
 */
export const donorTypeApi = {
  /** GET /api/v1/donor-types → DonorTypeResponse[]. */
  list: () => http.get('/v1/donor-types'),
};
