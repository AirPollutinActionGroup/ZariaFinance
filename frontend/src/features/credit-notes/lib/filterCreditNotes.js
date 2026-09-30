export const EMPTY_FILTERS = Object.freeze({ query: '', book: 'All', donor: null, from: '', to: '' });

/** Distinct donors on the given notes, as { id, name }, sorted by name — options for the Donor filter. */
export function donorsOf(notes) {
  const byKey = new Map();
  for (const n of notes) {
    if (n.donor?.name) byKey.set(String(n.donor.id ?? n.donor.name), n.donor);
  }
  return [...byKey.values()].sort((a, b) => a.name.localeCompare(b.name));
}

const donorKey = (d) => (d ? String(d.id ?? d.name) : null);

/**
 * Applies the Credit Notes list filters. Dates are "YYYY-MM-DD" strings, so
 * they compare correctly as text; `from`/`to` are inclusive. `fy` is an
 * optional financial year { startDate, endDate } (also inclusive) — kept
 * outside EMPTY_FILTERS because the page defaults it to the current year.
 */
export function filterCreditNotes(notes, filters) {
  const q = (filters.query || '').trim().toLowerCase();
  const fy = filters.fy;
  return notes.filter((n) => {
    if (fy && (n.date < fy.startDate || n.date > fy.endDate)) return false;
    if (filters.book !== 'All' && n.book !== filters.book) return false;
    if (filters.donor && donorKey(n.donor) !== donorKey(filters.donor)) return false;
    if (filters.from && n.date < filters.from) return false;
    if (filters.to && n.date > filters.to) return false;
    if (!q) return true;
    return [
      n.id,
      n.donor?.name,
      n.fundProfile?.name,
      n.grant?.name,
      n.tranche?.name,
      n.paymentMode?.name,
      n.bankAccount?.name,
      n.reference,
      n.remarks,
    ].some((text) => (text || '').toLowerCase().includes(q));
  });
}

export function hasActiveFilters(filters) {
  return Object.entries(EMPTY_FILTERS).some(([key, empty]) => filters[key] !== empty);
}
