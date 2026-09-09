export function formatDate(iso) {
  if (!iso) return null;
  return new Date(`${iso}T00:00:00`).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
}

export function formatDateRange(start, end) {
  const s = formatDate(start);
  if (!s) return '—';
  const e = formatDate(end);
  return e ? `${s} – ${e}` : s;
}
