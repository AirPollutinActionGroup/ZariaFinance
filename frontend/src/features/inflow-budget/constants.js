export const MODULE_ID = 'inflow-budget';

/** Funding-source language for a budget line. */
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

export const RECEIPT_STATUS = Object.freeze({
  RECEIVED: 'Received',
  DUE: 'Due',
  PENDING: 'Pending',
  OVERDUE: 'Overdue',
});

export const RECEIPT_STATUS_TONE = Object.freeze({
  RECEIVED: 'success',
  DUE: 'neutral',
  PENDING: 'warning',
  OVERDUE: 'error',
});

/** Days past the expected receipt date before a still-outstanding row is Overdue rather than Pending. */
export const OVERDUE_THRESHOLD_DAYS = 15;
