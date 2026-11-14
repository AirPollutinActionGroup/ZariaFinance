/** Days before the end date that an allocation counts as "ending soon". */
export const ENDING_SOON_DAYS = 30;

const DAY = 86400000;

function startOfToday() {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d;
}

/** Whole days from today to an ISO date (negative once it has passed). */
export function daysUntil(iso) {
  if (!iso) return null;
  return Math.round((new Date(`${iso}T00:00:00`) - startOfToday()) / DAY);
}

/**
 * RUNNING | ENDING_SOON | ENDED | UPCOMING — for chips and filters.
 * `active` (from the backend) decides ENDED; the rest is read from the dates.
 */
export function allocationStatus(allocation) {
  if (allocation.active === false) return 'ENDED';
  const toStart = daysUntil(allocation.startDate);
  if (toStart != null && toStart > 0) return 'UPCOMING';
  const toEnd = daysUntil(allocation.endDate);
  if (toEnd != null && toEnd <= ENDING_SOON_DAYS) return 'ENDING_SOON';
  return 'RUNNING';
}

export const STATUS_META = {
  RUNNING: { label: 'Running', tone: 'success' },
  UPCOMING: { label: 'Upcoming', tone: 'info' },
  ENDING_SOON: { label: 'Ending soon', tone: 'warning' },
  ENDED: { label: 'Ended', tone: 'neutral' },
};
