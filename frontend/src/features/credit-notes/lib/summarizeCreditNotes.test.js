import { describe, expect, it } from 'vitest';
import { summarizeCreditNotes } from './summarizeCreditNotes.js';

const greenline = { id: 7, name: 'Greenline CSR' };
const notes = [
  { status: 'ISSUED', amount: 4200, book: 'LC', donor: greenline, fundProfile: { id: 1, name: 'Air' }, disbursementType: 'Tranches' },
  { status: 'ISSUED', amount: 800, book: 'LC', donor: greenline, fundProfile: { id: 2, name: 'Water' }, disbursementType: 'Lump Sum' },
  { status: 'ISSUED', amount: 1000, book: 'FC', donor: null, fundProfile: null },
  { status: 'CANCELLED', amount: 9999, book: 'LC', donor: greenline, fundProfile: { id: 1, name: 'Air' } },
];

describe('summarizeCreditNotes', () => {
  it('totals issued notes and reports cancelled ones apart', () => {
    const s = summarizeCreditNotes(notes);
    expect(s.issuedTotal).toBe(6000);
    expect(s.issuedCount).toBe(3);
    expect(s.cancelledTotal).toBe(9999);
    expect(s.cancelledCount).toBe(1);
  });

  it('splits by fund, disbursement type and book', () => {
    const s = summarizeCreditNotes(notes);
    expect(s.toFundTotal).toBe(5000);
    expect(s.toFundCount).toBe(2);
    expect(s.fundCount).toBe(2);
    expect(s.donorCount).toBe(1);
    expect(s.byDisbursement).toEqual({
      'Lump Sum': { amount: 800, count: 1 },
      Tranches: { amount: 4200, count: 1 },
      None: { amount: 1000, count: 1 },
    });
    expect(s.byBook).toEqual({ LC: { amount: 5000, count: 2 }, FC: { amount: 1000, count: 1 } });
  });

  it('is all zeros for no notes', () => {
    const s = summarizeCreditNotes([]);
    expect(s.issuedTotal).toBe(0);
    expect(s.fundCount).toBe(0);
    expect(s.byBook.LC).toEqual({ amount: 0, count: 0 });
  });
});
