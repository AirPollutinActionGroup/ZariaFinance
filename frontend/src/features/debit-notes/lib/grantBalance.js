/**
 * Available balance on a donor fund / grant.
 *
 *   received  = Σ actual receipts on the fund profile's tranche criteria
 *               (Inflow Budget lines share the tranche-criterion id). The
 *               backend already counts credit notes there — one names its
 *               tranche, a lump-sum one lands on the fund's earliest line —
 *               so only credit notes that can't be placed on a line (the fund
 *               has no tranche plan) are added on top.
 *   credited  = Σ credit notes received into the fund (part of `received`)
 *   debited   = Σ debit notes charged to the fund
 *   spent     = debited
 *   available = received − spent
 *
 * `total` is the grant agreement's committed amount (null when the fund has
 * no grant yet). Outflow payments that aren't debit notes aren't linked to a
 * fund, so they can't be deducted here.
 */
export function computeGrantBalance({ fundProfile, grant, inflowLinesById, notes = [], credits = [] }) {
  const trancheIds = (fundProfile?.disbursementRules || [])
    .flatMap((r) => (r.trancheCriteria || []).map((t) => t.id))
    .filter((id) => id != null);

  const inflowReceived = trancheIds.reduce((sum, id) => {
    const line = inflowLinesById?.get(Number(id));
    return sum + (Number(line?.actualAmount) || 0);
  }, 0);

  const sameId = (a, b) => a != null && b != null && String(a) === String(b);
  const onThisFund = (n) => fundProfile && sameId(n.fundProfile?.id, fundProfile.id);
  const sum = (list) => list.reduce((s, n) => s + n.amount, 0);
  const fundCredits = credits.filter(onThisFund);
  const onALine = (n) =>
    trancheIds.some((id) => sameId(n.tranche?.id, id)) || (!n.tranche && n.disbursementType === 'Lump Sum' && trancheIds.length > 0);

  const received = inflowReceived + sum(fundCredits.filter((n) => !onALine(n)));
  const credited = sum(fundCredits);
  const debited = sum(notes.filter(onThisFund));
  const spent = debited;

  const total = grant?.totalGrantAmount != null ? Number(grant.totalGrantAmount) : null;

  return {
    total,
    received,
    debited,
    credited,
    spent,
    available: received - spent,
    hasTranches: trancheIds.length > 0,
    hasReceipts: received > 0,
  };
}
