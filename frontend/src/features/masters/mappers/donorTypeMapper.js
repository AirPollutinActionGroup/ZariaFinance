import { MASTER_STATUS_LABEL } from '../constants.js';

/**
 * DonorTypeMapper — translates between backend DTOs (DonorTypeResponse,
 * CreateDonorTypeRequest) and frontend view/form models. Backend field
 * names are preserved verbatim.
 */

/** DonorTypeResponse → view model. */
export function fromDonorTypeResponse(dto) {
  return {
    ...dto,
    statusLabel: MASTER_STATUS_LABEL[dto.status] || dto.status || '—',
    allowedFundSourceDomiciles: dto.allowedFundSourceDomiciles || [],
    allowedContributionTypes: dto.allowedContributionTypes || [],
  };
}

/** Form values → CreateDonorTypeRequest. There is no manual code — the id is the stable identifier. */
export function toCreateDonorTypeRequest(values) {
  return {
    name: values.name.trim(),
    status: values.status === 'Active',
    allowedFundSourceDomiciles: values.allowedFundSourceDomiciles || [],
    allowedContributionTypes: values.allowedContributionTypes || [],
  };
}
