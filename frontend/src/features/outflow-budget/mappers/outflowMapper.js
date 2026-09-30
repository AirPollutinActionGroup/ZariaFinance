/**
 * OutflowRowResponse → the outflow row view model. Rows come from APPROVED
 * budgets (one per budget line per quarter); payments aren't recorded on the
 * row itself any more — Spent comes from debit notes — so
 * `actualAmount` is always null (kept because lib/spent.js reads it).
 */
const num = (value) => (value == null || value === '' ? 0 : Number(value));

export function fromOutflowRowResponse(dto) {
  return {
    id: dto.id,
    budgetId: dto.budgetId,
    budgetCode: dto.budgetCode,
    budgetName: dto.budgetName,
    financialYear: dto.financialYear,
    budgetType: dto.budgetType,
    scope: dto.scope,
    stateName: dto.stateName || '',
    lineId: dto.lineId,
    lineCode: dto.lineCode,
    quarter: dto.quarter,
    quarterLabel: dto.quarterLabel,
    categoryId: dto.categoryId,
    categoryName: dto.categoryName,
    line: dto.line,
    book: dto.book,
    expectedDate: dto.expectedDate,
    expectedAmount: num(dto.expectedAmount),
    actualAmount: null,
    debitTotal: num(dto.debitTotal),
    spent: num(dto.spent),
    remaining: num(dto.remaining),
    status: dto.status,
  };
}
