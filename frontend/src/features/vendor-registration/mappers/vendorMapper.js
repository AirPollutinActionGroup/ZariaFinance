/**
 * vendorMapper — translates between backend DTOs (VendorResponse,
 * CreateVendorRequest) and the frontend form/view model. Backend field
 * names are preserved verbatim; only status casing and blank/null
 * normalisation differ between the two sides.
 */

const nullIfBlank = (value) => {
  if (value === undefined || value === null) return null;
  const trimmed = String(value).trim();
  return trimmed === '' ? null : trimmed;
};

/** VendorResponse → view model (status re-cased to match the UI's 'Active'/'Inactive' checks). */
export function fromVendorResponse(dto) {
  return {
    ...dto,
    status: dto.status === 'ACTIVE' ? 'Active' : 'Inactive',
  };
}

/** Form values → CreateVendorRequest. */
export function toCreateVendorRequest(values) {
  const isIndividual = values.entityType === 'Individual';
  const isIncorporationEligible = values.entityType === 'LLP' || values.entityType === 'Pvt Ltd';
  const showIncorporationDetails = isIncorporationEligible && values.hasIncorporationCertificate === 'Yes';
  const showGstDetails = !isIndividual && values.hasGstRegistration === 'Yes';
  const showMsmeDetails = !isIndividual && values.hasMsmeRegistration === 'Yes';

  return {
    entityType: values.entityType,
    legalName: values.legalName.trim(),
    hasIncorporationCertificate: isIncorporationEligible ? values.hasIncorporationCertificate : null,
    dateOfIncorporation: showIncorporationDetails ? nullIfBlank(values.dateOfIncorporation) : null,
    registrationNo: showIncorporationDetails ? nullIfBlank(values.registrationNo) : null,
    aadhaarNumber: isIndividual ? nullIfBlank(values.aadhaarNumber) : null,
    panNumber: values.panNumber.trim().toUpperCase(),
    hasGstRegistration: isIndividual ? null : values.hasGstRegistration,
    gstNumber: showGstDetails ? nullIfBlank(values.gstNumber)?.toUpperCase() ?? null : null,
    gstRegistrationType: showGstDetails ? values.gstRegistrationType : null,
    tanNumber: isIndividual ? null : nullIfBlank(values.tanNumber),
    hasMsmeRegistration: isIndividual ? null : values.hasMsmeRegistration,
    udyamNumber: showMsmeDetails ? nullIfBlank(values.udyamNumber) : null,
    enterpriseClassification: showMsmeDetails ? nullIfBlank(values.enterpriseClassification) : null,
    tdsSection: values.tdsSection,
    accountNumber: values.accountNumber.trim(),
    ifscCode: values.ifscCode.trim().toUpperCase(),
    accountHolderName: values.accountHolderName.trim(),
    bankName: nullIfBlank(values.bankName),
    branchName: nullIfBlank(values.branchName),
    paymentMode: values.paymentMode,
    contactName: values.contactName.trim(),
    phoneNumber: values.phoneNumber.trim(),
    contactEmail: values.contactEmail.trim(),
    registeredAddress: values.registeredAddress.trim(),
    state: values.state,
    pincode: values.pincode.trim(),
    vendorCategory: values.vendorCategory,
    relatedParty: values.relatedParty,
  };
}
