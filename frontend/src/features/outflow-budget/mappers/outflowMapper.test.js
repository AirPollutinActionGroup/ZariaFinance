import { describe, expect, it } from 'vitest';
import { fromOutflowRowResponse } from './outflowMapper.js';
import { rowRemaining, rowSpent } from '../lib/spent.js';

describe('outflowMapper', () => {
  it('maps a row and works with the spent helpers (no recorded payment)', () => {
    const row = fromOutflowRowResponse({
      id: 'BUD-2026-001-BL01-Q2',
      budgetCode: 'BUD-2026-001',
      lineCode: 'BL-01',
      quarter: 2,
      line: 'Salaries',
      book: 'LC',
      expectedDate: '2026-09-30',
      expectedAmount: '500',
      debitTotal: 300,
      spent: 300,
      remaining: 200,
      status: 'DUE',
    });
    expect(row).toMatchObject({ id: 'BUD-2026-001-BL01-Q2', expectedAmount: 500, actualAmount: null, spent: 300, stateName: '' });
    const debits = { [row.id]: 300 };
    expect(rowSpent(row, debits)).toBe(300);
    expect(rowRemaining(row, debits)).toBe(200);
  });
});
