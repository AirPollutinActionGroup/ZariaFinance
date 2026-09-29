import { describe, expect, it } from 'vitest';
import { financialYearOf, financialYearOptions, isFinancialYearLabel } from './financialYear.js';

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
