/**
 * Available balance on a donor fund / grant.
 *
 *   received  = money in from the donor. Taken as the larger of
 *                 · Σ actual receipts on the fund profile's tranche criteria
 *                   (Inflow Budget lines share the tranche-criterion id), and
 *                 · Σ Payment Window Credit (In) transactions on the fund
 *               — the two record the same receipts, so they're not added; the
 *               larger covers receipts the Inflow line hasn't picked up yet.
 *   debited   = Σ issued debit notes charged to the fund
 *               + Σ legacy Payment Window Debit (Out) transactions on it
 *   credited  = Σ issued credit notes returned to the fund
 *   spent     = debited − credited (can go below zero if more came back than went out)
 *   available = received − spent
 *
 * `total` is the grant agreement's committed amount (null when the fund has
 * no grant yet). Outflow payments that aren't debit notes aren't linked to a
 * fund, so they can't be deducted here.
 */
export function computeGrantBalance({ fundProfile, grant, inflowLinesById, notes = [], credits = [], transactions = [] }) {
  const trancheIds = (fundProfile?.disbursementRules || [])
    .flatMap((r) => (r.trancheCriteria || []).map((t) => t.id))
    .filter((id) => id != null);

  const inflowReceived = trancheIds.reduce((sum, id) => {
    const line = inflowLinesById?.get(Number(id));
    return sum + (Number(line?.actualAmount) || 0);
  }, 0);

  const sameId = (a, b) => a != null && b != null && String(a) === String(b);
  const fundTx = transactions.filter(
    (t) => fundProfile && (sameId(t.fundProfileId, fundProfile.id) || (grant && sameId(t.grantId, grant.id))),
  );
  const sumTx = (type) => fundTx.filter((t) => t.type === type).reduce((sum, t) => sum + (Number(t.amount) || 0), 0);
  const received = Math.max(inflowReceived, sumTx('CREDIT'));

  const onThisFund = (n) => n.status === 'ISSUED' && fundProfile && sameId(n.fundProfile?.id, fundProfile.id);
  const sumOnFund = (list) => list.filter(onThisFund).reduce((sum, n) => sum + n.amount, 0);
  const debited = sumOnFund(notes) + sumTx('DEBIT');
  const credited = sumOnFund(credits);
  const spent = debited - credited;

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
