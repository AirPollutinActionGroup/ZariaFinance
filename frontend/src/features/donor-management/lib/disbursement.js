/**
 * Adapts a fund profile's disbursement rule (DonorDisbursementRule, with its
 * trancheCriteria[].criteria[] release gates) into the shape the Grant Detail
 * page shows: a disbursement type label plus a flat list of release criteria
 * (implicit AND) drawn from every tranche's criteria.
 */

const DISBURSEMENT_TYPE_LABEL = { LUMP_SUM: 'Lump Sum', TRANCHES: 'Tranches' };

/** 'Lump Sum' | 'Tranches' — from the rule's own disbursementType; defaults to Lump Sum when absent. */
export function deriveDisbursementType(rule) {
  return DISBURSEMENT_TYPE_LABEL[rule?.disbursementType] || 'Lump Sum';
}

/**
 * Release criteria as a list, so the implicit AND is visible. Each entry is
 * { label, detail? }. Returns a single "On signing" entry when the rule has no
 * tranches/criteria defined yet.
 */
export function deriveReleaseCriteria(rule) {
  const items = (rule?.trancheCriteria || []).flatMap((t) => t.criteria || []);
  if (!items.length) return [{ label: 'On signing' }];

  return items.map((c) => ({
    label: c.releaseCriteriaLabel || c.releaseCriteria || 'Other',
    detail: c.description || undefined,
  }));
}
