/**
 * GrantMapper — GrantListResponse / GrantDetailsResponse ↔ view models,
 * form values → CreateGrantRequest. Field names mirror the backend DTOs.
 *
 * A grant's class is the profile's restriction class (A/B/C, `fundClassCode`),
 * not the donor typology enum.
 */

/** Agreement status (section 1 of the form) → display label. */
export const GRANT_STATUS_LABEL = {
  ACTIVE: 'Active',
  COMPLETED: 'Completed',
  CANCELLED: 'Cancelled',
};

/** Approval workflow state (isApproved) → display label. */
export const APPROVAL_STATUS_LABEL = {
  1: 'Approved',
  2: 'Pending',
  3: 'On hold',
  4: 'Completed',
};

export function fromGrantListResponse(dto) {
  return {
    ...dto,
    fundClassLabel: dto.fundClassCode ? `Class ${dto.fundClassCode}` : '—',
    statusLabel: GRANT_STATUS_LABEL[dto.status] || (dto.isActive ? 'Active' : 'Inactive'),
    approvalStatusLabel: APPROVAL_STATUS_LABEL[dto.isApproved] || '—',
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
    status: grant.status || 'ACTIVE',
    agreementDate: grant.agreementDate || '',
    startDate: grant.startDate || '',
    endDate: grant.endDate || '',
    grantCurrency: grant.grantCurrency || 'INR',
    fxLockedRate: grant.fxLockedRate != null ? String(grant.fxLockedRate) : '1',
    approvalStatus: grant.isApproved != null ? String(grant.isApproved) : '2',
    approvedBy: grant.approvedBy != null ? String(grant.approvedBy) : '',
    // approvalDate is a timestamp on the wire; the form field is a date.
    approvalDate: grant.approvalDate ? String(grant.approvalDate).slice(0, 10) : '',
    approvalRemarks: grant.approvalRemarks || '',
    // Not shown on the form — round-tripped so saving can't wipe them.
    description: grant.description || '',
    agreementDocumentPath: grant.agreementDocumentPath || '',
  };
}

/**
 * Form values → CreateGrantRequest. Donor, class and the total (Σ of the fund
 * profile's tranche plan) are all derived server-side from fundProfileId.
 */
export function toCreateGrantRequest(values) {
  return {
    // Omitted on create → backend auto-generates ZRY/GA/YYYY/NNN.
    grantCode: values.grantCode?.trim() || undefined,
    fundProfileId: Number(values.fundProfileId),
    programmeId: values.programmeId ? Number(values.programmeId) : null,
    agreementName: values.agreementName.trim(),
    status: values.status || 'ACTIVE',
    agreementDate: values.agreementDate,
    startDate: values.startDate,
    endDate: values.endDate,
    grantCurrency: (values.grantCurrency || 'INR').trim().toUpperCase(),
    fxLockedRate: Number(values.fxLockedRate || 1),
    approvalStatus: Number(values.approvalStatus || 2),
    approvedBy: values.approvedBy ? Number(values.approvedBy) : null,
    approvalDate: values.approvalDate || null,
    approvalRemarks: values.approvalRemarks?.trim() || null,
    description: values.description?.trim() || null,
    agreementDocumentPath: values.agreementDocumentPath?.trim() || null,
  };
}
