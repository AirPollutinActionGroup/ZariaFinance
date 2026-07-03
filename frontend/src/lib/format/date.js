/**
 * Date formatting helpers. The backend serialises LocalDate as
 * "YYYY-MM-DD" and LocalDateTime as ISO strings; these helpers render
 * them for display without any timezone arithmetic surprises.
 */

const DISPLAY = new Intl.DateTimeFormat('en-IN', {
  day: '2-digit',
  month: 'short',
  year: 'numeric',
});

const DISPLAY_WITH_TIME = new Intl.DateTimeFormat('en-IN', {
  day: '2-digit',
  month: 'short',
  year: 'numeric',
  hour: '2-digit',
  minute: '2-digit',
});

/** "2025-04-01" | ISO datetime → "01 Apr 2025". */
export function formatDate(value) {
  if (!value) return '—';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '—';
  return DISPLAY.format(date);
}

/** ISO datetime → "01 Apr 2025, 10:32 am". */
export function formatDateTime(value) {
  if (!value) return '—';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '—';
  return DISPLAY_WITH_TIME.format(date);
}
