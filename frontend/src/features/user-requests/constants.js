export const MODULE_ID = 'user-requests';

/**
 * Mirrors the isApproved code on backend/finance/.../userRegisterNew — never
 * rename these keys, they must match UserRegisterResponse.approvalStatus.
 */
export const USER_REQUEST_STATUS_LABEL = Object.freeze({
  PENDING: 'Pending',
  APPROVED: 'Approved',
  REJECTED: 'Rejected',
});

export const USER_REQUEST_STATUS_TONE = Object.freeze({
  PENDING: 'warning',
  APPROVED: 'success',
  REJECTED: 'error',
});
