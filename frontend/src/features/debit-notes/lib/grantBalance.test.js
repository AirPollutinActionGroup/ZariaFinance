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
      { amount: 50000, fundProfile: { id: 5 } },
      { amount: 70000, fundProfile: { id: 6 } }, // other fund
      { amount: 1000, fundProfile: null },
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

  it('counts credit notes as received — once, since the Inflow line already includes those on a tranche', () => {
    const notes = [{ amount: 50000, fundProfile: { id: 5 } }];
    const credits = [
      { amount: 8000, fundProfile: { id: 5 }, tranche: { id: '11' } }, // already in line 11's 600000
      { amount: 3000, fundProfile: { id: 5 }, disbursementType: 'Lump Sum' }, // backend puts it on the earliest line
      { amount: 999, fundProfile: { id: 6 }, tranche: { id: '11' } }, // other fund
    ];
    const balance = computeGrantBalance({ fundProfile, grant: null, inflowLinesById, notes, credits });
    expect(balance.received).toBe(600000);
    expect(balance.credited).toBe(11000);
    expect(balance.spent).toBe(50000);
    expect(balance.available).toBe(550000);
  });

  it('adds credit notes on a fund with no tranche plan straight to received', () => {
    const balance = computeGrantBalance({
      fundProfile: { id: 1 },
      grant: null,
      inflowLinesById: new Map(),
      credits: [{ amount: 2500, fundProfile: { id: 1 } }],
    });
    expect(balance.received).toBe(2500);
    expect(balance.available).toBe(2500);
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
