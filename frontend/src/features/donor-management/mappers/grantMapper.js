import { FUND_CLASS, GRANT_STATUS } from '../constants.js';

/**
 * GrantMapper — GrantListResponse / GrantDetailsResponse ↔ view models,
 * form values → CreateGrantRequest. Field names mirror the backend DTOs.
 */

export function fromGrantListResponse(dto) {
  return {
    ...dto,
    fundClassLabel: FUND_CLASS[dto.fundClass] || dto.fundClass || '—',
    statusLabel: GRANT_STATUS[dto.grantStatus] || dto.grantStatus || '—',
  };
}

export function fromGrantDetailsResponse(dto) {
  return fromGrantListResponse(dto);
}

/** Form values → CreateGrantRequest (LocalDate as YYYY-MM-DD strings). */
export function toCreateGrantRequest(values) {
  return {
    grantCode: values.grantCode.trim(),
    donorId: Number(values.donorId),
    programmeId: Number(values.programmeId),
    agreementName: values.agreementName.trim(),
    agreementDate: values.agreementDate,
    startDate: values.startDate,
    endDate: values.endDate,
    totalGrantAmount: Number(values.totalGrantAmount),
    fundClass: values.fundClass,
    description: values.description?.trim() || null,
    agreementDocumentPath: values.agreementDocumentPath?.trim() || null,
  };
}
