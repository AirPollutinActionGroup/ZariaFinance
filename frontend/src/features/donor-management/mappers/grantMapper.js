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

/** Form values → CreateGrantRequest (donor/programme/class derived from the profile server-side). */
export function toCreateGrantRequest(values) {
  return {
    grantCode: values.grantCode.trim(),
    fundProfileId: Number(values.fundProfileId),
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
