import { OVERDUE_THRESHOLD_DAYS, PAYMENT_STATUS } from '../constants.js';

const DAY_MS = 24 * 60 * 60 * 1000;

/** Payment status is derived, never stored: Paid once actuals are recorded,
 * otherwise Due / Pending / Overdue depending on how far past the expected
 * payment date the "as at" reference has moved. */
export function getRowStatus(row, asAt) {
  if (row.actualAmount != null) return PAYMENT_STATUS.PAID;
  const daysLate = Math.floor((asAt - new Date(row.expectedDate)) / DAY_MS);
  if (daysLate <= 0) return PAYMENT_STATUS.DUE;
  if (daysLate <= OVERDUE_THRESHOLD_DAYS) return PAYMENT_STATUS.PENDING;
  return PAYMENT_STATUS.OVERDUE;
}
