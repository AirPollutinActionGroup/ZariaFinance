export { donorsOf } from '../../credit-notes/lib/filterCreditNotes.js';

export const EMPTY_FILTERS = Object.freeze({
  query: '',
  reason: 'All',
  book: 'All',
  lineId: null,
  donor: null,
  from: '',
  to: '',
});

const donorKey = (d) => (d ? String(d.id ?? d.name) : null);

/**
 * Applies the Debit Notes list filters. Dates are "YYYY-MM-DD" strings, so
 * they compare correctly as text; `from`/`to` are inclusive. `fy` is an
 * optional financial year { startDate, endDate } (also inclusive) — kept
 * outside EMPTY_FILTERS because the page defaults it to the current year.
 */
export function filterDebitNotes(notes, filters, lineById = {}) {
  const q = (filters.query || '').trim().toLowerCase();
  const fy = filters.fy;
  return notes.filter((n) => {
    if (fy && (n.date < fy.startDate || n.date > fy.endDate)) return false;
    if (filters.reason !== 'All' && n.reason !== filters.reason) return false;
    if (filters.book && filters.book !== 'All' && n.book !== filters.book) return false;
    if (filters.lineId && n.outflowLineId !== filters.lineId) return false;
    if (filters.donor && donorKey(n.donor) !== donorKey(filters.donor)) return false;
    if (filters.from && n.date < filters.from) return false;
    if (filters.to && n.date > filters.to) return false;
    if (!q) return true;
    return [
      n.id,
      n.outflowLineId,
      lineById[n.outflowLineId]?.line,
      n.reference,
      n.remarks,
      n.payee?.name,
      n.ledger?.name,
      n.group?.name,
      n.donor?.name,
      n.fundProfile?.name,
      n.grant?.name,
    ].some((text) => (text || '').toLowerCase().includes(q));
  });
}

export function hasActiveFilters(filters) {
  return Object.entries(EMPTY_FILTERS).some(([key, empty]) => filters[key] !== empty);
}
