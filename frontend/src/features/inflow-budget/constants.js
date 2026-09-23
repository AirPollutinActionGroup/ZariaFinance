export const MODULE_ID = 'inflow-budget';

/**
 * Mirrors the grant fund profile's fundMode (donor.enums.FundMode:
 * RESTRICTED | UNRESTRICTED) — never rename these keys, they must match the
 * backend response exactly.
 */
export const RESTRICTION_TYPE = Object.freeze({
  RESTRICTED: 'Restricted',
  UNRESTRICTED: 'Unrestricted',
});

export const RESTRICTION_TONE = Object.freeze({
  RESTRICTED: 'warning',
  UNRESTRICTED: 'success',
});

export const RECEIPT_STATUS = Object.freeze({
  RECEIVED: 'Received',
  AWAITED: 'Awaited',
  SLIPPED: 'Slipped',
  OVERDUE: 'Overdue',
});

export const RECEIPT_STATUS_TONE = Object.freeze({
  RECEIVED: 'success',
  AWAITED: 'neutral',
  SLIPPED: 'warning',
  OVERDUE: 'error',
});

/** Days past the expected date before a still-outstanding row is Overdue rather than Slipped. */
export const OVERDUE_THRESHOLD_DAYS = 30;
