/**
 * Adapts the current flat fund-profile disbursement rule (ruleType / trigger /
 * gate) into the richer shape the Grant Detail spec asks for: a disbursement
 * type plus a list of release criteria (implicit AND).
 *
 * This is a presentation-side adaptation only — the backend still stores the
 * single flat rule. A proper multi-criteria model (criterion types with their
 * own fields, schedule type) is a separate backend change.
 */

/** 'Lump Sum' | 'Tranches' — derived from the rule text, falling back to tranche count. */
export function deriveDisbursementType(rule, tranches = []) {
  const type = (rule?.ruleType || '').toLowerCase();
  if (type.includes('lump')) return 'Lump Sum';
  if (type) return 'Tranches';
  return (tranches?.length || 0) > 1 ? 'Tranches' : 'Lump Sum';
}

/**
 * Release criteria as a list, so the implicit AND is visible. Each entry is
 * { label, detail? }. Returns a single "On signing" entry when the rule carries
 * no gate/trigger/milestone.
 */
export function deriveReleaseCriteria(rule) {
  if (!rule) return [{ label: 'On signing' }];

  const criteria = [];

  if (rule.minPriorUtilisationRequired != null) {
    criteria.push({
      label: 'Utilisation threshold',
      detail: `≥ ${Number(rule.minPriorUtilisationRequired)}% prior utilisation (cumulative)`,
    });
  }

  if (rule.milestoneRequired) {
    criteria.push({ label: 'Milestone based', detail: 'milestone met + designated sign-off' });
  }

  const trigger = (rule.releaseTrigger || '').trim();
  if (trigger) {
    const t = trigger.toLowerCase();
    if (t.includes('uc') || t.includes('utilis')) {
      criteria.push({ label: 'Utilisation Certificate (UC)', detail: trigger });
    } else if (t.includes('report') || t.includes('narrative') || t.includes('audit')) {
      criteria.push({ label: 'Financial / narrative / audit report', detail: trigger });
    } else if (t.includes('approval')) {
      criteria.push({ label: 'Donor approval', detail: trigger });
    } else if (t.includes('sign')) {
      criteria.push({ label: 'On signing', detail: trigger });
    } else {
      criteria.push({ label: 'Other', detail: trigger });
    }
  }

  return criteria.length ? criteria : [{ label: 'On signing' }];
}
