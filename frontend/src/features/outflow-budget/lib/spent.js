/**
 * Spent on a line = recorded payment + issued debit notes − issued credit
 * notes against it. Remaining = budgeted − spent (negative when the line is
 * overspent), so the row figures always add up to the summary card's totals.
 */
export function rowDebits(row, debitTotals = {}) {
  return debitTotals[row.id] || 0;
}

export function rowCredits(row, creditTotals = {}) {
  return creditTotals[row.id] || 0;
}

export function rowSpent(row, debitTotals = {}, creditTotals = {}) {
  return (row.actualAmount || 0) + rowDebits(row, debitTotals) - rowCredits(row, creditTotals);
}

export function rowRemaining(row, debitTotals = {}, creditTotals = {}) {
  return row.expectedAmount - rowSpent(row, debitTotals, creditTotals);
}
