import { DONOR_TYPE, FUND_SOURCE_DOMICILE } from '../constants.js';

/**
 * DonorMapper — translates between backend DTOs (DonorResponse,
 * CreateDonorRequest, UpdateDonorRequest) and frontend view/form models.
 * Backend field names are preserved verbatim, except the identity document:
 * the form's `idType`/`idNumber` (INDIVIDUAL_ID_TYPE keys) map to the
 * backend's generic `documentType` (IdentityDocumentType enum)/`documentNumber`,
 * and `passportNumber` maps to `passportId`.
 */

/** Frontend idType (INDIVIDUAL_ID_TYPE key) → backend IdentityDocumentType. */
const ID_TYPE_TO_DOCUMENT_TYPE = {
  PAN: 'PAN_CARD',
  AADHAR: 'AADHAAR_CARD',
  VOTER_ID: 'VOTER_ID',
  DRIVING_LICENSE: 'DRIVING_LICENSE',
  PASSPORT: 'PASSPORT_ID',
  FOREIGN_TAX_ID: 'FOREIGN_TAX_ID',
};

const DOCUMENT_TYPE_TO_ID_TYPE = Object.fromEntries(
  Object.entries(ID_TYPE_TO_DOCUMENT_TYPE).map(([idType, documentType]) => [documentType, idType]),
);

/** DonorResponse → view model. */
export function fromDonorResponse(dto) {
  return {
    ...dto,
    donorTypeLabel: DONOR_TYPE[dto.donorType] || dto.donorType || '—',
    fundSourceDomicileLabel: FUND_SOURCE_DOMICILE[dto.fundSourceDomicile] || dto.fundSourceDomicile || '—',
    contacts: dto.contacts || [],
    idType: DOCUMENT_TYPE_TO_ID_TYPE[dto.documentType] || '',
    idNumber: dto.documentNumber || '',
    passportNumber: dto.passportId || '',
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
    book: nullIfBlank(values.book),
    foreignFundSourceType: nullIfBlank(values.foreignFundSourceType),
    foreignCountryId: nullIfBlank(values.foreignCountryId),
    passportId: nullIfBlank(values.passportNumber),
    documentType: ID_TYPE_TO_DOCUMENT_TYPE[values.idType] || null,
    documentNumber: nullIfBlank(values.idNumber),
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
    book: donor.book || '',
    idType: DOCUMENT_TYPE_TO_ID_TYPE[donor.documentType] || '',
    idNumber: donor.documentNumber || '',
    foreignFundSourceType: donor.foreignFundSourceType || '',
    foreignCountryId: donor.foreignCountryId || '',
    passportNumber: donor.passportId || '',
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
