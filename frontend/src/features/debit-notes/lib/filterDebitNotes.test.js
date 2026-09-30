import { describe, expect, it } from 'vitest';
import { EMPTY_FILTERS, filterDebitNotes, hasActiveFilters } from './filterDebitNotes.js';

const notes = [
  { id: 'DN-1', outflowLineId: 'BL-01', date: '2026-05-01', reason: 'FX_DIFFERENCE', reference: 'SBI', remarks: '' },
  { id: 'DN-2', outflowLineId: 'BL-02', date: '2026-06-15', reason: 'OTHER', reference: '', remarks: 'Rent' },
  { id: 'DN-3', outflowLineId: 'BL-01', date: '2026-06-30', reason: 'OTHER', reference: '', remarks: '' },
];
const lineById = { 'BL-01': { line: 'Salaries' }, 'BL-02': { line: 'Office rent' } };
const ids = (list) => list.map((n) => n.id);

describe('filterDebitNotes', () => {
  it('returns everything with empty filters', () => {
    expect(ids(filterDebitNotes(notes, EMPTY_FILTERS, lineById))).toEqual(['DN-1', 'DN-2', 'DN-3']);
    expect(hasActiveFilters(EMPTY_FILTERS)).toBe(false);
  });

  it('filters by reason, line and inclusive date range', () => {
    expect(ids(filterDebitNotes(notes, { ...EMPTY_FILTERS, reason: 'OTHER' }))).toEqual(['DN-2', 'DN-3']);
    expect(ids(filterDebitNotes(notes, { ...EMPTY_FILTERS, reason: 'OTHER', lineId: 'BL-01' }))).toEqual(['DN-3']);
    expect(ids(filterDebitNotes(notes, { ...EMPTY_FILTERS, from: '2026-06-15', to: '2026-06-30' }))).toEqual(['DN-2', 'DN-3']);
    expect(hasActiveFilters({ ...EMPTY_FILTERS, from: '2026-06-15' })).toBe(true);
  });

  it('filters by book, donor and financial year', () => {
    const greenline = { id: 7, name: 'Greenline CSR' };
    const withFund = [
      { ...notes[0], book: 'LC', donor: greenline },
      { ...notes[1], book: 'FC', donor: null },
      { ...notes[2], book: 'LC', donor: { id: 9, name: 'Other' } },
    ];
    expect(ids(filterDebitNotes(withFund, { ...EMPTY_FILTERS, book: 'LC' }))).toEqual(['DN-1', 'DN-3']);
    expect(ids(filterDebitNotes(withFund, { ...EMPTY_FILTERS, donor: { id: 7, name: 'Greenline CSR' } }))).toEqual(['DN-1']);
    const fy = { startDate: '2026-06-01', endDate: '2026-06-20' };
    expect(ids(filterDebitNotes(withFund, { ...EMPTY_FILTERS, fy }))).toEqual(['DN-2']);
    expect(hasActiveFilters({ ...EMPTY_FILTERS, fy })).toBe(false); // fy is tracked by the page, not EMPTY_FILTERS
  });

  it('searches note id, line description, reference and remarks', () => {
    expect(ids(filterDebitNotes(notes, { ...EMPTY_FILTERS, query: 'office' }, lineById))).toEqual(['DN-2']);
    expect(ids(filterDebitNotes(notes, { ...EMPTY_FILTERS, query: 'sbi' }, lineById))).toEqual(['DN-1']);
    expect(ids(filterDebitNotes(notes, { ...EMPTY_FILTERS, query: 'rent' }, lineById))).toEqual(['DN-2']);
    const withPayee = [{ ...notes[2], payee: { id: 'P1', name: 'Apex Solar' } }];
    expect(ids(filterDebitNotes(withPayee, { ...EMPTY_FILTERS, query: 'apex' }, lineById))).toEqual(['DN-3']);
  });
});
