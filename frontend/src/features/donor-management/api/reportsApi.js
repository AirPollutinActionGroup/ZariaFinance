import { http } from '../../../lib/api/apiClient.js';

/**
 * Repository for the donor-module reports (ReportsController).
 */
export const reportsApi = {
  /** GET /api/v1/reports/fcra-register → FcraRegisterEntry[]. */
  fcraRegister: () => http.get('/v1/reports/fcra-register'),

  /** GET /api/v1/reports/utilisation-compliance → UtilisationComplianceEntry[]. */
  utilisationCompliance: () => http.get('/v1/reports/utilisation-compliance'),
};
