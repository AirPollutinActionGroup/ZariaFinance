/**
 * Adapts a fund profile's disbursement rule (DonorDisbursementRule + its
 * trancheDetail) into the shape the Grant Detail spec asks for: a disbursement
 * type plus a list of release criteria (implicit AND) — one per tranche.
 */

import { CRITERION_TYPE_OPTIONS } from '../constants.js';

function criterionLabel(value) {
  return CRITERION_TYPE_OPTIONS.find((t) => t.value === value)?.label || value || 'On signing';
}

/** 'Lump Sum' | 'Tranches' — direct from DisbursementType. */
export function deriveDisbursementType(rule) {
  return rule?.disbursementType === 'TRANCHE' ? 'Tranches' : 'Lump Sum';
}

/**
 * Release criteria as a list, so the implicit AND is visible — one entry per
 * tranche's release criterion. Each entry is { label, detail? }. Returns a
 * single "On signing" entry when the rule carries no tranches yet.
 */
export function deriveReleaseCriteria(rule) {
  const tranches = rule?.trancheDetail || [];
  if (!rule || tranches.length === 0) return [{ label: 'On signing' }];

  return tranches.map((t) => {
    const label = criterionLabel(t.releaseCriteria);
    let detail;
    switch (t.releaseCriteria) {
      case 'FIXED_DATE':
        detail = t.releaseDate || undefined;
        break;
      case 'MILESTONE_BASED':
        detail = t.milestoneName ? `"${t.milestoneName}"` : undefined;
        break;
      case 'UTILISATION_THRESHOLD':
        detail = t.utilisationPercentage != null
          ? `≥ ${t.utilisationPercentage}% · ${t.triggerBase || 'Previous Tranche'}`
          : undefined;
        break;
      case 'OTHER':
        detail = t.description || undefined;
        break;
      default:
        detail = undefined;
    }
    return { label, detail };
  });
}
