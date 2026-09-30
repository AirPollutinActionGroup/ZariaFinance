import { describe, expect, it } from 'vitest';
import { rowDebits, rowRemaining, rowSpent } from './spent.js';

describe('outflow spent', () => {
  const paid = { id: 'A', expectedAmount: 1000, actualAmount: 1000 };
  const unpaid = { id: 'B', expectedAmount: 500, actualAmount: null };
  const debits = { A: 150, B: 100 };

  it('adds debit notes to the recorded payment', () => {
    expect(rowDebits(paid, debits)).toBe(150);
    expect(rowSpent(paid, debits)).toBe(1150);
    expect(rowSpent(unpaid, debits)).toBe(100);
    expect(rowSpent(unpaid)).toBe(0);
  });

  it('goes negative on Remaining when a line is overspent', () => {
    expect(rowRemaining(paid, debits)).toBe(-150);
    expect(rowRemaining(unpaid, debits)).toBe(400);
    expect(rowRemaining(paid)).toBe(0);
  });
});
