const bucket = () => ({ amount: 0, count: 0 });
const keyOf = (ref) => (ref ? String(ref.id ?? ref.name) : null);

/**
 * Figures for the Credit Notes summary strip. Every note counts (there is no
 * cancel workflow).
 *   byDisbursement: 'Lump Sum' | 'Tranches' | 'None' (not returned to a fund)
 *   byBook:         'LC' | 'FC'
 */
export function summarizeCreditNotes(notes) {
  const summary = {
    issuedTotal: 0,
    issuedCount: 0,
    toFundTotal: 0,
    toFundCount: 0,
    fundCount: 0,
    donorCount: 0,
    byDisbursement: { 'Lump Sum': bucket(), Tranches: bucket(), None: bucket() },
    byBook: { LC: bucket(), FC: bucket() },
  };
  const funds = new Set();
  const donors = new Set();

  for (const n of notes) {
    summary.issuedTotal += n.amount;
    summary.issuedCount += 1;

    const disb = n.fundProfile ? n.disbursementType || 'Lump Sum' : 'None';
    const d = summary.byDisbursement[disb] || summary.byDisbursement.None;
    d.amount += n.amount;
    d.count += 1;

    const b = summary.byBook[n.book];
    if (b) {
      b.amount += n.amount;
      b.count += 1;
    }

    if (n.fundProfile) {
      summary.toFundTotal += n.amount;
      summary.toFundCount += 1;
      funds.add(keyOf(n.fundProfile));
    }
    if (n.donor) donors.add(keyOf(n.donor));
  }

  summary.fundCount = funds.size;
  summary.donorCount = donors.size;
  return summary;
}
