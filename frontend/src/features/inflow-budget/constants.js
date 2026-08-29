export const MODULE_ID = 'inflow-budget';

/**
 * Mirrors the restriction language used across donor/grant screens
 * (see donation-management/constants.js FUND_MODE) plus the two extra
 * states this view needs: Corpus and Deferred income.
 */
export const RESTRICTION_TYPE = Object.freeze({
  RESTRICTED: 'Restricted',
  UNRESTRICTED: 'Unrestricted',
  CORPUS: 'Corpus',
  DEFERRED: 'Deferred',
});

export const RESTRICTION_TONE = Object.freeze({
  RESTRICTED: 'warning',
  UNRESTRICTED: 'success',
  CORPUS: 'info',
  DEFERRED: 'neutral',
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

/** Fixed "as at" reference date for this mock dataset's ageing calculations. */
export const AS_AT_DATE = '2026-06-30';
