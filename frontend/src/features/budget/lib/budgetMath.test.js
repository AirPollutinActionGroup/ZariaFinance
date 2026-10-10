import { describe, expect, it } from 'vitest';
import { budgetTotal, isBudgetValid, lineTotal, quarterTotals, totalsBy, validateBudget } from './budgetMath.js';

const line = (overrides = {}) => ({
  id: 'L1',
  category: 'PERSONNEL',
  description: 'Salaries',
  book: 'LC',
  q1: 100,
  q2: 200,
  q3: '',
  q4: '50',
  ...overrides,
});

describe('budget totals', () => {
  it('sums a line across quarters, treating blanks as zero and strings as numbers', () => {
    expect(lineTotal(line())).toBe(350);
  });

  it('aggregates budget, quarter and grouped totals', () => {
    const lines = [line(), line({ id: 'L2', category: 'TRAVEL', q1: 1000, q2: 0, q4: 0 })];
    expect(budgetTotal(lines)).toBe(1350);
    expect(quarterTotals(lines)).toEqual({ q1: 1100, q2: 200, q3: 0, q4: 50 });
    expect(totalsBy(lines, 'category')).toEqual([
      { key: 'TRAVEL', amount: 1000 },
      { key: 'PERSONNEL', amount: 350 },
    ]);
  });
});

describe('validateBudget', () => {
  const header = { name: 'FY budget', financialYear: '2026-27', budgetType: 'PROGRAMME', programme: 'Clean Air' };

  it('accepts a complete budget', () => {
    expect(isBudgetValid(validateBudget({ ...header, lines: [line()] }))).toBe(true);
  });

  it('requires header fields and at least one line', () => {
    const errors = validateBudget({ name: '', financialYear: '', budgetType: 'PROGRAMME', programme: '', lines: [] });
    expect(Object.keys(errors.header).sort()).toEqual(['financialYear', 'name', 'programme']);
    expect(errors.form).toBeTruthy();
    expect(isBudgetValid(errors)).toBe(false);
  });

  it('needs a budget type; only programme budgets need a programme', () => {
    expect(validateBudget({ ...header, budgetType: '', lines: [line()] }).header.budgetType).toBeTruthy();
    const org = validateBudget({ ...header, budgetType: 'ORGANISATION', programme: '', lines: [line()] });
    expect(isBudgetValid(org)).toBe(true);
  });

  it('requires category, description and a positive phased amount on each line', () => {
    const errors = validateBudget({
      ...header,
      lines: [line({ category: '', description: ' ' }), line({ id: 'L2', q1: 0, q2: 0, q4: 0 }), line({ id: 'L3', q1: -5 })],
    });
    expect(Object.keys(errors.lines.L1).sort()).toEqual(['category', 'description']);
    expect(errors.lines.L2.amount).toMatch(/at least one quarter/);
    expect(errors.lines.L3.amount).toMatch(/negative/);
  });
});
