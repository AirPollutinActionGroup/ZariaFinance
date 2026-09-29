import { describe, expect, it } from 'vitest';
import { computeGrantBalance } from './grantBalance.js';

const fundProfile = {
  id: 5,
  disbursementRules: [{ trancheCriteria: [{ id: 11 }, { id: 12 }, { id: null }] }],
};
const inflowLinesById = new Map([
  [11, { actualAmount: '600000' }],
  [12, { actualAmount: null }], // tranche not yet received
]);

describe('computeGrantBalance', () => {
  it('available = received on the fund tranches − issued debit notes on that fund', () => {
    const notes = [
      { status: 'ISSUED', amount: 50000, fundProfile: { id: 5 } },
      { status: 'CANCELLED', amount: 99999, fundProfile: { id: 5 } }, // ignored
      { status: 'ISSUED', amount: 70000, fundProfile: { id: 6 } }, // other fund
      { status: 'ISSUED', amount: 1000, fundProfile: null },
    ];
    expect(computeGrantBalance({ fundProfile, grant: { totalGrantAmount: '1000000' }, inflowLinesById, notes })).toEqual({
      total: 1000000,
      received: 600000,
      debited: 50000,
      credited: 0,
      spent: 50000,
      available: 550000,
      hasTranches: true,
      hasReceipts: true,
    });
  });

  it('gives issued credit notes on the fund back to Available, kept apart from debits', () => {
    const notes = [{ status: 'ISSUED', amount: 50000, fundProfile: { id: 5 } }];
    const credits = [
      { status: 'ISSUED', amount: 8000, fundProfile: { id: 5 } },
      { status: 'CANCELLED', amount: 99999, fundProfile: { id: 5 } }, // ignored
    ];
    const balance = computeGrantBalance({ fundProfile, grant: null, inflowLinesById, notes, credits });
    expect(balance.debited).toBe(50000);
    expect(balance.credited).toBe(8000);
    expect(balance.spent).toBe(42000);
    expect(balance.available).toBe(558000);
  });

  it('counts Payment Window receipts on the fund when the Inflow line has none yet', () => {
    const noInflow = new Map([[11, { actualAmount: null }]]);
    const transactions = [
      { type: 'CREDIT', amount: 40, fundProfileId: 5 },
      { type: 'CREDIT', amount: 25, fundProfileId: '5' },
      { type: 'CREDIT', amount: 900, fundProfileId: 6 }, // other fund
      { type: 'DEBIT', amount: 10, fundProfileId: 5 }, // legacy debit counts as spent
    ];
    const balance = computeGrantBalance({ fundProfile, grant: null, inflowLinesById: noInflow, transactions });
    expect(balance.received).toBe(65);
    expect(balance.debited).toBe(10);
    expect(balance.available).toBe(55);
  });

  it("doesn't double count receipts that are on both the Inflow line and the transactions", () => {
    const transactions = [{ type: 'CREDIT', amount: 600000, grantId: 9 }];
    const balance = computeGrantBalance({ fundProfile, grant: { id: 9 }, inflowLinesById, transactions });
    expect(balance.received).toBe(600000);
  });

  it('handles a fund with no grant and no tranches', () => {
    expect(computeGrantBalance({ fundProfile: { id: 1 }, grant: null, inflowLinesById: new Map() })).toEqual({
      total: null,
      received: 0,
      debited: 0,
      credited: 0,
      spent: 0,
      available: 0,
      hasTranches: false,
      hasReceipts: false,
    });
  });
});
