export const MODULE_ID = 'outflow-budget';

/**
 * Funding-source language mirrors the Inflow Budget layer (see
 * inflow-budget/constants.js RESTRICTION_TYPE) so a budget line reads the
 * same way on both sides of the ledger.
 */
export const FUNDING_SOURCE_TYPE = Object.freeze({
  RESTRICTED: 'Restricted',
  UNRESTRICTED: 'Unrestricted',
  CORPUS: 'Corpus',
});

export const FUNDING_SOURCE_TONE = Object.freeze({
  RESTRICTED: 'warning',
  UNRESTRICTED: 'neutral',
  CORPUS: 'info',
});

export const PAYMENT_STATUS = Object.freeze({
  PAID: 'Paid',
  DUE: 'Due',
  PENDING: 'Pending',
  OVERDUE: 'Overdue',
});

export const PAYMENT_STATUS_TONE = Object.freeze({
  PAID: 'success',
  DUE: 'neutral',
  PENDING: 'warning',
  OVERDUE: 'error',
});

/** Days past the expected payment date before a still-outstanding row is Overdue rather than Pending. */
export const OVERDUE_THRESHOLD_DAYS = 15;

/** Fixed "as at" reference date for this mock dataset's ageing calculations. */
export const AS_AT_DATE = '2026-06-30';
