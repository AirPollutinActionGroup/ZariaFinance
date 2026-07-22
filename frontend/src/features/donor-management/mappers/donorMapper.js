import { DONOR_TYPE, FUND_SOURCE_DOMICILE } from '../constants.js';

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
    donorTypeLabel: DONOR_TYPE[dto.donorType] || dto.donorType || '—',
    fundSourceDomicileLabel: FUND_SOURCE_DOMICILE[dto.fundSourceDomicile] || dto.fundSourceDomicile || '—',
    contacts: dto.contacts || [],
  };
}

const nullIfBlank = (value) => {
  if (value === undefined || value === null) return null;
  const trimmed = String(value).trim();
  return trimmed === '' ? null : trimmed;
};

const numberOrNull = (value) => (value ? Number(value) : null);

/** Form values → CreateDonorRequest. */
export function toCreateDonorRequest(values) {
  return {
    donorCode: values.donorCode.trim(),
    donorName: values.donorName.trim(),
    donorType: values.donorType,
    fundSourceDomicile: values.fundSourceDomicile,
    fcraApplicable: Boolean(values.fcraApplicable),
    foreignFundSourceType: nullIfBlank(values.foreignFundSourceType),
    foreignCountryId: nullIfBlank(values.foreignCountryId),
    panCardNumber: nullIfBlank(values.panCardNumber),
    foreignTaxIdentifier: nullIfBlank(values.foreignTaxIdentifier),
    email: values.email.trim(),
    phoneNumber: nullIfBlank(values.phoneNumber),
    website: nullIfBlank(values.website),
    spocNameOfThePerson: values.spocNameOfThePerson.trim(),
    spocPhoneNumber: nullIfBlank(values.spocPhoneNumber),
    spocEmail: values.spocEmail.trim(),
    address: nullIfBlank(values.address),
    address2: nullIfBlank(values.address2),
    cityId: numberOrNull(values.cityId),
    stateId: numberOrNull(values.stateId),
    countryId: numberOrNull(values.countryId),
    postalCode: nullIfBlank(values.postalCode),
    registrationNumber: nullIfBlank(values.registrationNumber),
  };
}

/** Form values → UpdateDonorRequest (all fields optional server-side; no donorCode). */
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
    id: donor.id || '',
    donorCode: donor.donorCode || '',
    donorName: donor.donorName || '',
    donorType: donor.donorType || '',
    fundSourceDomicile: donor.fundSourceDomicile || '',
    fcraApplicable: Boolean(donor.fcraApplicable),
    foreignFundSourceType: donor.foreignFundSourceType || '',
    foreignCountryId: donor.foreignCountryId || '',
    panCardNumber: donor.panCardNumber || '',
    foreignTaxIdentifier: donor.foreignTaxIdentifier || '',
    email: donor.email || '',
    phoneNumber: donor.phoneNumber || '',
    website: donor.website || '',
    spocNameOfThePerson: donor.spocNameOfThePerson || '',
    spocPhoneNumber: donor.spocPhoneNumber || '',
    spocEmail: donor.spocEmail || '',
    address: donor.address || '',
    address2: donor.address2 || '',
    cityId: donor.cityId || '',
    stateId: donor.stateId || '',
    countryId: donor.countryId || '',
    postalCode: donor.postalCode || '',
    registrationNumber: donor.registrationNumber || '',
  };
}
