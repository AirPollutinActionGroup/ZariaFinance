import { FUND_CLASS, DONOR_STATUS } from '../constants.js';

/**
 * DonorMapper — translates between backend DTOs (DonorResponse,
 * CreateDonorRequest, UpdateDonorRequest) and frontend view/form models.
 * Backend field names are preserved verbatim; the mapper only normalises
 * empties and attaches display labels.
 */

/** DonorResponse → view model. */
export function fromDonorResponse(dto) {
  return {
    ...dto,
    fundClassLabel: FUND_CLASS[dto.fundClass] || dto.fundClass || '—',
    statusLabel: DONOR_STATUS[dto.status] || dto.status || '—',
    contacts: dto.contacts || [],
  };
}

const nullIfBlank = (value) => {
  if (value === undefined || value === null) return null;
  const trimmed = String(value).trim();
  return trimmed === '' ? null : trimmed;
};

/** Form values → CreateDonorRequest. */
export function toCreateDonorRequest(values) {
  return {
    donorCode: values.donorCode.trim(),
    donorName: values.donorName.trim(),
    donorType: values.donorType.trim(),
    fundClass: values.fundClass,
    email: values.email.trim(),
    phoneNumber: nullIfBlank(values.phoneNumber),
    website: nullIfBlank(values.website),
    registrationNumber: nullIfBlank(values.registrationNumber),
    taxId: nullIfBlank(values.taxId),
    address: nullIfBlank(values.address),
    cityId: values.cityId ? Number(values.cityId) : null,
    stateId: values.stateId ? Number(values.stateId) : null,
    country: nullIfBlank(values.country),
    postalCode: nullIfBlank(values.postalCode),
  };
}

/** Form values → UpdateDonorRequest (all fields optional server-side). */
export function toUpdateDonorRequest(values) {
  const { donorCode: _ignored, ...rest } = toCreateDonorRequest({
    ...values,
    donorCode: values.donorCode ?? '',
  });
  return rest;
}

/** DonorResponse → form default values for the edit screen. */
export function toDonorFormValues(donor) {
  return {
    donorCode: donor.donorCode || '',
    donorName: donor.donorName || '',
    donorType: donor.donorType || '',
    fundClass: donor.fundClass || '',
    email: donor.email || '',
    phoneNumber: donor.phoneNumber || '',
    website: donor.website || '',
    registrationNumber: donor.registrationNumber || '',
    taxId: donor.taxId || '',
    address: donor.address || '',
    cityId: '',
    stateId: '',
    country: donor.country || '',
    postalCode: donor.postalCode || '',
  };
}
