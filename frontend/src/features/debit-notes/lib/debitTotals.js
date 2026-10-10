/** { [outflowLineId]: total of debit notes } for a list of debit notes. */
export function debitTotalsByLine(notes = []) {
  const totals = {};
  for (const n of notes) {
    if (!n.outflowLineId) continue;
    totals[n.outflowLineId] = (totals[n.outflowLineId] || 0) + n.amount;
  }
  return totals;
}
