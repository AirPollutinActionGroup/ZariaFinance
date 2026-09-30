import { describe, expect, it } from 'vitest';
import { summarizeDebitNotes } from './summarizeDebitNotes.js';

const greenline = { id: 7, name: 'Greenline CSR' };
const notes = [
  { id: 'DN-1', amount: 4200, book: 'LC', outflowLineId: 'BL-01', reason: 'FX_DIFFERENCE', donor: greenline, fundProfile: { id: 1, name: 'Air' } },
  { id: 'DN-2', amount: 800, book: 'LC', outflowLineId: 'BL-01', reason: null, donor: greenline, fundProfile: { id: 2, name: 'Water' } },
  { id: 'DN-3', amount: 1000, book: 'FC', outflowLineId: 'BL-02', reason: null, donor: null, fundProfile: null },
];

describe('summarizeDebitNotes', () => {
  it('totals the notes', () => {
    const s = summarizeDebitNotes(notes);
    expect(s.issuedTotal).toBe(6000);
    expect(s.issuedCount).toBe(3);
    expect(s.lineCount).toBe(2);
  });

  it('splits over / within budget, fund-charged and by book', () => {
    const s = summarizeDebitNotes(notes);
    expect(s.overBudget).toEqual({ amount: 4200, count: 1 });
    expect(s.withinBudget).toEqual({ amount: 1800, count: 2 });
    expect(s.toFund).toEqual({ amount: 5000, count: 2 });
    expect(s.fundCount).toBe(2);
    expect(s.donorCount).toBe(1);
    expect(s.byBook.LC).toEqual({ amount: 5000, count: 2 });
    expect(s.byBook.FC).toEqual({ amount: 1000, count: 1 });
  });

  it('is all zeros for no notes', () => {
    const s = summarizeDebitNotes([]);
    expect(s.issuedTotal).toBe(0);
    expect(s.toFund.count).toBe(0);
    expect(s.byBook.LC.amount).toBe(0);
  });
});
