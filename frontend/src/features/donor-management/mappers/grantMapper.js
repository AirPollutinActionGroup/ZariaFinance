import { GRANT_STATUS } from '../constants.js';

/**
 * GrantMapper — GrantListResponse / GrantDetailsResponse ↔ view models,
 * form values → CreateGrantRequest. Field names mirror the backend DTOs.
 *
 * A grant's class is the profile's restriction class (A/B/C, `fundClassCode`),
 * not the donor typology enum.
 */

export function fromGrantListResponse(dto) {
  return {
    ...dto,
    fundClassLabel: dto.fundClassCode ? `Class ${dto.fundClassCode}` : '—',
    statusLabel: GRANT_STATUS[dto.grantStatus] || dto.grantStatus || '—',
  };
}

export function fromGrantDetailsResponse(dto) {
  return fromGrantListResponse(dto);
}

/** GrantDetailsResponse → edit-form values (strings, mirroring grantFormDefaults). */
export function toGrantFormValues(grant) {
  return {
    grantCode: grant.grantCode || '',
    donorId: grant.donorId != null ? String(grant.donorId) : '',
    fundProfileId: grant.fundProfileId != null ? String(grant.fundProfileId) : '',
    programmeId: grant.programmeId != null ? String(grant.programmeId) : '',
    agreementName: grant.agreementName || '',
    agreementDate: grant.agreementDate || '',
    startDate: grant.startDate || '',
    endDate: grant.endDate || '',
    totalGrantAmount: grant.totalGrantAmount != null ? String(grant.totalGrantAmount) : '',
    grantCurrency: grant.grantCurrency || 'INR',
    fxLockedRate: grant.fxLockedRate != null ? String(grant.fxLockedRate) : '1',
    description: grant.description || '',
    agreementDocumentPath: grant.agreementDocumentPath || '',
  };
}

/** Form values → CreateGrantRequest (donor/class derived from the profile server-side). */
export function toCreateGrantRequest(values) {
  return {
    // Omitted on create → backend auto-generates ZRY/GA/YYYY/NNN.
    grantCode: values.grantCode?.trim() || undefined,
    fundProfileId: Number(values.fundProfileId),
    programmeId: values.programmeId ? Number(values.programmeId) : null,
    agreementName: values.agreementName.trim(),
    agreementDate: values.agreementDate,
    startDate: values.startDate,
    endDate: values.endDate,
    totalGrantAmount: Number(values.totalGrantAmount),
    grantCurrency: (values.grantCurrency || 'INR').trim().toUpperCase(),
    fxLockedRate: Number(values.fxLockedRate || 1),
    description: values.description?.trim() || null,
    agreementDocumentPath: values.agreementDocumentPath?.trim() || null,
  };
}
