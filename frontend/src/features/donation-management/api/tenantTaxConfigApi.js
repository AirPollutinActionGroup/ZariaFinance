import { http } from '../../../lib/api/apiClient.js';

/** Repository for /api/v1/tenant/tax-config (TenantTaxConfigController). */
export const tenantTaxConfigApi = {
  /** GET /api/v1/tenant/tax-config → TenantTaxConfigResponse. */
  get: () => http.get('/v1/tenant/tax-config'),

  /** PUT /api/v1/tenant/tax-config — body: TenantTaxConfigRequest → TenantTaxConfigResponse. */
  update: (payload) => http.put('/v1/tenant/tax-config', payload),
};
