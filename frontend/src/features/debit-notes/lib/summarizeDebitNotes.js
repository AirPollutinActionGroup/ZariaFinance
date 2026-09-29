const bucket = () => ({ amount: 0, count: 0 });
const keyOf = (ref) => (ref ? String(ref.id ?? ref.name) : null);
const add = (b, amount) => {
  b.amount += amount;
  b.count += 1;
};

/**
 * Figures for the Debit Notes summary strip. Only issued notes count towards
 * the money figures; cancelled ones are reported separately.
 *   overBudget / withinBudget: notes with / without an over-budget reason
 *   toFund:        issued notes charged to a donor fund profile
 *   creditedBack:  credit notes raised against the issued notes
 *                  (`creditedByDebit` = { [debitNoteId]: credited amount })
 *   byBook:        'LC' | 'FC'
 */
export function summarizeDebitNotes(notes, creditedByDebit = {}) {
  const summary = {
    issuedTotal: 0,
    issuedCount: 0,
    lineCount: 0,
    overBudget: bucket(),
    withinBudget: bucket(),
    toFund: bucket(),
    fundCount: 0,
    donorCount: 0,
    creditedBack: bucket(),
    byBook: { LC: bucket(), FC: bucket() },
    cancelledTotal: 0,
    cancelledCount: 0,
  };
  const lines = new Set();
  const funds = new Set();
  const donors = new Set();

  for (const n of notes) {
    if (n.status !== 'ISSUED') {
      summary.cancelledTotal += n.amount;
      summary.cancelledCount += 1;
      continue;
    }
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

    const credited = creditedByDebit[n.id] || 0;
    if (credited) add(summary.creditedBack, credited);
  }

  summary.lineCount = lines.size;
  summary.fundCount = funds.size;
  summary.donorCount = donors.size;
  return summary;
}
