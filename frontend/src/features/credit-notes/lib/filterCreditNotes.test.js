import { describe, expect, it } from 'vitest';
import { donorsOf, EMPTY_FILTERS, filterCreditNotes, hasActiveFilters } from './filterCreditNotes.js';

const greenline = { id: 7, name: 'Greenline CSR' };
const bluewave = { id: 3, name: 'Bluewave Sponsors' };
const notes = [
  { id: 'CN-1', date: '2026-05-01', book: 'LC', donor: greenline, fundProfile: { id: 1, name: 'Air quality fund' }, reference: 'SBI', remarks: '' },
  { id: 'CN-2', date: '2026-06-15', book: 'FC', donor: bluewave, fundProfile: { id: 2, name: 'DUST grant' }, tranche: { id: 11, name: 'Tranche 2 — ₹5,00,000' }, reference: '', remarks: 'Rebate' },
  { id: 'CN-3', date: '2026-06-30', book: 'LC', donor: null, fundProfile: null, reference: '', remarks: '' },
];
const ids = (list) => list.map((n) => n.id);

describe('filterCreditNotes', () => {
  it('returns everything with empty filters', () => {
    expect(ids(filterCreditNotes(notes, EMPTY_FILTERS))).toEqual(['CN-1', 'CN-2', 'CN-3']);
    expect(hasActiveFilters(EMPTY_FILTERS)).toBe(false);
  });

  it('filters by book, donor and inclusive date range', () => {
    expect(ids(filterCreditNotes(notes, { ...EMPTY_FILTERS, book: 'FC' }))).toEqual(['CN-2']);
    expect(ids(filterCreditNotes(notes, { ...EMPTY_FILTERS, donor: greenline }))).toEqual(['CN-1']);
    expect(ids(filterCreditNotes(notes, { ...EMPTY_FILTERS, from: '2026-06-15', to: '2026-06-30' }))).toEqual(['CN-2', 'CN-3']);
    expect(hasActiveFilters({ ...EMPTY_FILTERS, book: 'LC' })).toBe(true);
  });

  it('searches note id, donor, fund profile, tranche, reference and remarks', () => {
    expect(ids(filterCreditNotes(notes, { ...EMPTY_FILTERS, query: 'air quality' }))).toEqual(['CN-1']);
    expect(ids(filterCreditNotes(notes, { ...EMPTY_FILTERS, query: 'tranche 2' }))).toEqual(['CN-2']);
    expect(ids(filterCreditNotes(notes, { ...EMPTY_FILTERS, query: 'bluewave' }))).toEqual(['CN-2']);
    expect(ids(filterCreditNotes(notes, { ...EMPTY_FILTERS, query: 'sbi' }))).toEqual(['CN-1']);
  });

  it('filters by financial year, inclusive of both ends', () => {
    const fy = { startDate: '2026-05-01', endDate: '2026-06-15' };
    expect(ids(filterCreditNotes(notes, { ...EMPTY_FILTERS, fy }))).toEqual(['CN-1', 'CN-2']);
    expect(ids(filterCreditNotes(notes, { ...EMPTY_FILTERS, fy: null }))).toEqual(['CN-1', 'CN-2', 'CN-3']);
    // The year isn't one of the resettable filters — the page defaults it to the current year.
    expect(hasActiveFilters({ ...EMPTY_FILTERS, fy })).toBe(false);
  });

  it('lists distinct donors by name for the filter', () => {
    expect(donorsOf([...notes, { donor: greenline }])).toEqual([bluewave, greenline]);
  });
});
