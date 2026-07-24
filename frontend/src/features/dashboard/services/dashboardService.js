/**
 * Dashboard aggregation logic — pure functions over data returned by the
 * real donor/grant endpoints. No invented figures: every number on the
 * dashboard is derived from backend records.
 */

/** Canonical FC / DC / CSR order + labels for the funding-class breakdown. */
export const FUNDING_CLASS_ORDER = ['FC', 'DC', 'CSR'];
const FUNDING_CLASS_LABEL = {
  FC: 'Foreign Contribution',
  DC: 'Domestic Contribution',
  CSR: 'Corporate Social Responsibility',
};

/**
 * Normalise the server's funding-by-class rows into a stable FC → DC → CSR
 * order with numeric amounts, filling absent buckets with zeroes so the card
 * always renders all three. Returns [] when the summary carries no breakdown.
 */
export function fundingClassRows(summary) {
  const rows = summary?.fundingByClass;
  if (!Array.isArray(rows) || rows.length === 0) return [];
  const byBucket = new Map(rows.map((row) => [row.bucket, row]));
  return FUNDING_CLASS_ORDER.map((bucket) => {
    const row = byBucket.get(bucket);
    return {
      bucket,
      label: row?.label || FUNDING_CLASS_LABEL[bucket],
      grantCount: Number(row?.grantCount) || 0,
      committed: Number(row?.committed) || 0,
      received: Number(row?.received) || 0,
    };
  });
}

/** A donor is "inactive" (and therefore blocking) when draft or explicitly deactivated. */
function isInactiveDonor(donor) {
  return donor.isActive === false || donor.status === 'DRAFT';
}

export function computeDashboardMetrics(allDonors, allGrants) {
  // Draft records never contribute to any dashboard metric — drop them before
  // aggregating so counts and amounts match the Draft-free backend summary.
  const donors = allDonors.filter((donor) => donor.status !== 'DRAFT');
  const grants = allGrants;

  const activeDonors = donors.filter((donor) => !isInactiveDonor(donor));
  const draftDonorCount = donors.filter((donor) => donor.status === 'DRAFT').length;

  const totalCommitted = grants.reduce(
    (sum, grant) => sum + (Number(grant.totalGrantAmount) || 0),
    0,
  );
  const openGrants = grants.filter((grant) => grant.isActive === true);
  const openCommitted = openGrants.reduce(
    (sum, grant) => sum + (Number(grant.totalGrantAmount) || 0),
    0,
  );

  // A grant is "blocked" when it hangs off an inactive/draft donor — its
  // commitment is excluded from every receivable/realised figure.
  const inactiveDonorIds = new Set(
    donors.filter(isInactiveDonor).map((donor) => donor.id),
  );
  const blockedGrants = grants.filter((grant) => inactiveDonorIds.has(grant.donorId));
  const blockedCommitted = blockedGrants.reduce(
    (sum, grant) => sum + (Number(grant.totalGrantAmount) || 0),
    0,
  );

  return {
    donorCount: donors.length,
    activeDonorCount: activeDonors.length,
    draftDonorCount,
    draftBlockingAmount: blockedCommitted,
    grantCount: grants.length,
    openGrantCount: openGrants.length,
    activeGrantCount: grants.filter((grant) => grant.isActive === true).length,
    closedGrantCount: grants.filter((grant) => grant.isActive === false).length,
    blockedGrantCount: blockedGrants.length,
    totalCommitted,
    openCommitted,
  };
}

/** Most recently starting grants for the register preview. */
export function recentGrants(grants, limit = 8) {
  return [...grants]
    .sort((a, b) => String(b.startDate || '').localeCompare(String(a.startDate || '')))
    .slice(0, limit);
}

/**
 * Governance rule: no ACTIVE grant should hang off an inactive donor. Returns
 * the offending grants (real data) so the dashboard can surface an exception.
 */
export function grantsWithDonorStatusClash(donors, grants) {
  const inactiveDonorIds = new Set(
    donors.filter((donor) => donor.isActive === false).map((donor) => donor.id),
  );
  return grants.filter(
    (grant) => grant.isActive === true && inactiveDonorIds.has(grant.donorId),
  );
}
