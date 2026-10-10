import { describe, expect, it } from 'vitest';
import {
  financialYearOf,
  financialYearOptions,
  isFinancialYearLabel,
  labelFromStartDate,
  toFinancialYearOptions,
} from './financialYear.js';

describe('financialYearOf', () => {
  it('starts the FY in April', () => {
    expect(financialYearOf(new Date(2026, 8, 25))).toBe('2026-27');
    expect(financialYearOf(new Date(2026, 3, 1))).toBe('2026-27');
    expect(financialYearOf(new Date(2027, 2, 31))).toBe('2026-27');
    expect(financialYearOf(new Date(2026, 2, 31))).toBe('2025-26');
  });

  it('pads the century rollover', () => {
    expect(financialYearOf(new Date(2099, 5, 1))).toBe('2099-00');
  });
});

describe('Financial Year master rows', () => {
  it('labels a year from its start date', () => {
    expect(labelFromStartDate('2026-04-01')).toBe('2026-27');
    expect(labelFromStartDate('2099-04-01')).toBe('2099-00');
    expect(labelFromStartDate(null)).toBe('');
  });

  it('builds options oldest first, keeping id, code and status', () => {
    const rows = [
      { id: 3, code: 'FY 2026-27', startDate: '2026-04-01', status: 'ACTIVE' },
      { id: 1, code: 'FY 2024-25', startDate: '2024-04-01', status: 'CLOSED' },
    ];
    expect(toFinancialYearOptions(rows)).toEqual([
      { id: 1, label: '2024-25', code: 'FY 2024-25', status: 'CLOSED' },
      { id: 3, label: '2026-27', code: 'FY 2026-27', status: 'ACTIVE' },
    ]);
  });
});

describe('isFinancialYearLabel', () => {
  it('accepts consecutive-year labels only', () => {
    expect(isFinancialYearLabel('2026-27')).toBe(true);
    expect(isFinancialYearLabel('2099-00')).toBe(true);
    expect(isFinancialYearLabel('2026-28')).toBe(false);
    expect(isFinancialYearLabel('2026')).toBe(false);
    expect(isFinancialYearLabel(null)).toBe(false);
  });
});

describe('financialYearOptions', () => {
  it('lists previous, current and next FY', () => {
    expect(financialYearOptions(new Date(2026, 8, 25))).toEqual(['2025-26', '2026-27', '2027-28']);
  });
});
