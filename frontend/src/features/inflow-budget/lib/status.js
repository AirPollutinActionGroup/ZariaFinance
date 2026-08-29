import { OVERDUE_THRESHOLD_DAYS, RECEIPT_STATUS } from '../constants.js';

const DAY_MS = 24 * 60 * 60 * 1000;

/** Receipt status is derived, never stored: Received once actuals are recorded,
 * otherwise Awaited / Slipped / Overdue depending on how far past the expected
 * date the "as at" reference has moved. */
export function getRowStatus(row, asAt) {
  if (row.actualAmount != null) return RECEIPT_STATUS.RECEIVED;
  const daysLate = Math.floor((asAt - new Date(row.expectedDate)) / DAY_MS);
  if (daysLate <= 0) return RECEIPT_STATUS.AWAITED;
  if (daysLate <= OVERDUE_THRESHOLD_DAYS) return RECEIPT_STATUS.SLIPPED;
  return RECEIPT_STATUS.OVERDUE;
}
