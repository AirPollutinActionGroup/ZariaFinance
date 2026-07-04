/**
 * Dashboard aggregation logic — pure functions over data returned by the
 * real donor/grant endpoints. No invented figures: every number on the
 * dashboard is derived from backend records.
 */

const OPEN_GRANT_STATUSES = new Set(['APPROVED', 'ACTIVE', 'ON_HOLD']);

export function computeDashboardMetrics(donors, grants) {
  const activeDonors = donors.filter((donor) => donor.isActive !== false);
  const totalCommitted = grants.reduce(
    (sum, grant) => sum + (Number(grant.totalGrantAmount) || 0),
    0,
  );
  const openGrants = grants.filter((grant) => OPEN_GRANT_STATUSES.has(grant.grantStatus));
  const openCommitted = openGrants.reduce(
    (sum, grant) => sum + (Number(grant.totalGrantAmount) || 0),
    0,
  );

  return {
    donorCount: donors.length,
    activeDonorCount: activeDonors.length,
    grantCount: grants.length,
    openGrantCount: openGrants.length,
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
