import { BUDGET_TYPE, QUARTERS } from '../constants.js';

const toNumber = (value) => {
  const n = Number(value);
  return Number.isFinite(n) ? n : 0;
};

/** Sum of a line's quarterly phasing. */
export function lineTotal(line) {
  return QUARTERS.reduce((sum, q) => sum + toNumber(line[q.key]), 0);
}

export function budgetTotal(lines = []) {
  return lines.reduce((sum, line) => sum + lineTotal(line), 0);
}

/** { q1, q2, q3, q4 } across every line. */
export function quarterTotals(lines = []) {
  return QUARTERS.reduce((acc, q) => {
    acc[q.key] = lines.reduce((sum, line) => sum + toNumber(line[q.key]), 0);
    return acc;
  }, {});
}

/** Totals grouped by a line field (e.g. 'category', 'book'), largest first. */
export function totalsBy(lines = [], field) {
  const map = new Map();
  for (const line of lines) {
    const key = line[field] || '—';
    map.set(key, (map.get(key) || 0) + lineTotal(line));
  }
  return Array.from(map, ([key, amount]) => ({ key, amount })).sort((a, b) => b.amount - a.amount);
}

/**
 * Validates a budget draft. Returns { header: {field: msg}, lines: {lineId: {field: msg}}, form: msg|null };
 * `isBudgetValid` tells whether it is clean.
 */
export function validateBudget(draft) {
  const header = {};
  const lines = {};
  let form = null;

  if (!draft.name?.trim()) header.name = 'Budget name is required';
  if (!draft.financialYear) header.financialYear = 'Select a financial year';
  if (!BUDGET_TYPE[draft.budgetType]) header.budgetType = 'Choose programme-based or organisation-based';
  // A programme budget must name its programme; an organisation budget is org-wide unless a department is picked.
  if (draft.budgetType === 'PROGRAMME' && !draft.programme?.trim()) header.programme = 'Select the programme';

  if (!draft.lines?.length) {
    form = 'Add at least one budget line';
  }

  for (const line of draft.lines || []) {
    const errs = {};
    if (!line.category) errs.category = 'Required';
    if (!line.description?.trim()) errs.description = 'Required';
    if (QUARTERS.some((q) => toNumber(line[q.key]) < 0)) errs.amount = 'Amounts cannot be negative';
    else if (lineTotal(line) <= 0) errs.amount = 'Phase an amount into at least one quarter';
    if (Object.keys(errs).length) lines[line.id] = errs;
  }

  return { header, lines, form };
}

export function isBudgetValid(errors) {
  return !errors.form && !Object.keys(errors.header).length && !Object.keys(errors.lines).length;
}
