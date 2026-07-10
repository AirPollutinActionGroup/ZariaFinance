/**
 * MOCK funding-position layer.
 *
 * The backend currently tracks only a grant's committed amount (totalGrantAmount)
 * and status — it does NOT yet track tranches, receipts or utilisation. The
 * design preview's dashboard is built around a "funding chain"
 * (Committed → Received → Utilised → Available), so those downstream figures are
 * derived here as *illustrative* values from the real committed amount + status.
 *
 * Everything in this file is clearly-labelled mock data. The moment the backend
 * exposes real receipt/utilisation endpoints, replace deriveGrantFunding() with
 * a mapper over the real DTO and delete the ratios below — nothing else on the
 * dashboard needs to change.
 */

// Illustrative "share of committed that has been received" by grant status.
const RECEIVED_RATIO = {
  CLOSED: 1,
  COMPLETED: 1,
  ACTIVE: 0.65,
  ON_HOLD: 0.3,
  APPROVED: 0.15,
  PENDING_APPROVAL: 0,
  DRAFT: 0,
  TERMINATED: 0,
};

// Illustrative "share of received that has been utilised" by grant status.
const UTILISED_OF_RECEIVED = {
  CLOSED: 0.95,
  COMPLETED: 0.95,
  ACTIVE: 0.7,
  ON_HOLD: 0.5,
  APPROVED: 0.4,
  PENDING_APPROVAL: 0,
  DRAFT: 0,
  TERMINATED: 0,
};

// A grant whose commitment is excluded from every live figure (mirrors the
// preview's "Blocked" concept — a commitment not yet real income).
const BLOCKED_STATUSES = new Set(['DRAFT', 'TERMINATED']);

export function isBlockedGrant(grant) {
  return BLOCKED_STATUSES.has(grant?.grantStatus);
}

// Small deterministic wobble per grant so the derived figures don't look
// uniform — stable across renders (no Math.random).
function jitter(id) {
  const n = Number(id) || 0;
  return (((n * 37) % 11) - 5) / 100; // -0.05 … +0.05
}

const clamp01 = (v) => Math.max(0, Math.min(1, v));

/** Illustrative per-grant funding position derived from real committed + status. */
export function deriveGrantFunding(grant) {
  const committedInr = Number(grant?.totalGrantAmount) || 0;
  const status = grant?.grantStatus;
  const blocked = isBlockedGrant(grant);

  const rr = blocked ? 0 : clamp01((RECEIVED_RATIO[status] ?? 0) + jitter(grant?.id));
  const receivedInr = Math.round(committedInr * rr);
  const utilisedInr = Math.round(receivedInr * (UTILISED_OF_RECEIVED[status] ?? 0));
  const availableInr = receivedInr - utilisedInr;
  const outstandingInr = Math.max(0, committedInr - receivedInr);

  return { committedInr, receivedInr, utilisedInr, availableInr, outstandingInr, blocked };
}

/**
 * Portfolio funding totals for the funding-chain card. Blocked commitments are
 * excluded from committed/received/utilised (shown separately as `blocked`).
 */
export function computeFundingTotals(grants = []) {
  let committed = 0;
  let received = 0;
  let utilised = 0;
  let blocked = 0;

  for (const grant of grants) {
    const f = deriveGrantFunding(grant);
    if (f.blocked) {
      blocked += f.committedInr;
      continue;
    }
    committed += f.committedInr;
    received += f.receivedInr;
    utilised += f.utilisedInr;
  }

  return {
    committed,
    received,
    utilised,
    blocked,
    available: received - utilised,
    open: committed - received,
  };
}
