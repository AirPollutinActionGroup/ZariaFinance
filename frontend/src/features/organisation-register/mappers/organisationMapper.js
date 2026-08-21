import { ORGANISATION_STATUS_LABEL } from '../constants.js';

/**
 * OrganisationMapper — translates between backend DTOs (OrganisationResponse,
 * CreateOrganisationRequest) and frontend view/form models. Backend field
 * names are preserved verbatim.
 */

/** OrganisationResponse → view model. */
export function fromOrganisationResponse(dto) {
  return {
    ...dto,
    statusLabel: ORGANISATION_STATUS_LABEL[dto.status] || dto.status || '—',
  };
}

const nullIfBlank = (value) => {
  if (value === undefined || value === null) return null;
  const trimmed = String(value).trim();
  return trimmed === '' ? null : trimmed;
};

/** Form values → CreateOrganisationRequest. */
export function toCreateOrganisationRequest(values) {
  return {
    name: values.name.trim(),
    shortName: values.shortName.trim().toLowerCase(),
    email: values.email.trim(),
    phone: values.phone.trim(),
    webUrl: nullIfBlank(values.webUrl),
    address1: values.address1.trim(),
    address2: nullIfBlank(values.address2),
    cityId: Number(values.cityId),
    stateId: Number(values.stateId),
    zipCode: values.zipCode.trim(),
  };
}
