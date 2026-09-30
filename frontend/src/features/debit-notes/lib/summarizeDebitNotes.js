const bucket = () => ({ amount: 0, count: 0 });
const keyOf = (ref) => (ref ? String(ref.id ?? ref.name) : null);
const add = (b, amount) => {
  b.amount += amount;
  b.count += 1;
};

/**
 * Figures for the Debit Notes summary strip. Every note counts (there is no
 * cancel workflow).
 *   overBudget / withinBudget: notes with / without an over-budget reason
 *   toFund:        notes charged to a donor fund profile
 *   byBook:        'LC' | 'FC'
 */
export function summarizeDebitNotes(notes) {
  const summary = {
    issuedTotal: 0,
    issuedCount: 0,
    lineCount: 0,
    overBudget: bucket(),
    withinBudget: bucket(),
    toFund: bucket(),
    fundCount: 0,
    donorCount: 0,
    byBook: { LC: bucket(), FC: bucket() },
  };
  const lines = new Set();
  const funds = new Set();
  const donors = new Set();

  for (const n of notes) {
    summary.issuedTotal += n.amount;
    summary.issuedCount += 1;
    if (n.outflowLineId) lines.add(n.outflowLineId);

    add(n.reason ? summary.overBudget : summary.withinBudget, n.amount);
    if (summary.byBook[n.book]) add(summary.byBook[n.book], n.amount);

    if (n.fundProfile) {
      add(summary.toFund, n.amount);
      funds.add(keyOf(n.fundProfile));
    }
    if (n.donor) donors.add(keyOf(n.donor));
  }

  summary.lineCount = lines.size;
  summary.fundCount = funds.size;
  summary.donorCount = donors.size;
  return summary;
}
