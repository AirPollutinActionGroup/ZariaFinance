/**
 * Spent on a line = recorded payment + the debit notes against it. Remaining =
 * budgeted − spent (negative when the line is overspent), so the row figures
 * always add up to the summary card's totals. Credit notes aren't tied to a
 * line, so they don't change Spent.
 */
export function rowDebits(row, debitTotals = {}) {
  return debitTotals[row.id] || 0;
}

export function rowSpent(row, debitTotals = {}) {
  return (row.actualAmount || 0) + rowDebits(row, debitTotals);
}

export function rowRemaining(row, debitTotals = {}) {
  return row.expectedAmount - rowSpent(row, debitTotals);
}
