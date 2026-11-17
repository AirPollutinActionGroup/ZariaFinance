/**
 * Funding records — the unified view of a fund profile and the grant agreement
 * built on it. The backend keeps them as two resources (a profile backs at
 * most one grant, linked by grant.fundProfileId); this module joins them on the
 * client so users work with one "funding" record through its whole life:
 *
 *   Terms (profile only) → Pending approval → Approved → On hold → Completed
 *
 * Pure functions only — no React, no fetching — so the join is unit-testable.
 */
import { FUND_CLASS_SHORT } from '../../donor-management/constants.js';

/** Lifecycle stages in display order. `approval` matches grant.isApproved. */
export const STAGES = Object.freeze([
  {
    key: 'terms',
    label: 'Terms only',
    hint: 'Fund profile set up — no grant agreement signed yet',
    tone: 'neutral',
    color: 'var(--muted)',
    approval: null,
  },
  {
    key: 'pending',
    label: 'Pending approval',
    hint: 'Agreement recorded, waiting for approval',
    tone: 'warning',
    color: 'var(--warn)',
    approval: 2,
  },
  {
    key: 'approved',
    label: 'Approved',
    hint: 'Agreement approved — live funding',
    tone: 'success',
    color: 'var(--ok)',
    approval: 1,
  },
  {
    key: 'onhold',
    label: 'On hold',
    hint: 'Agreement paused for review',
    tone: 'warning',
    color: 'var(--warn)',
    approval: 3,
  },
  {
    key: 'completed',
    label: 'Completed',
    hint: 'Agreement has run its course',
    tone: 'info',
    color: 'var(--info)',
    approval: 4,
  },
]);

export const STAGE_BY_KEY = Object.freeze(Object.fromEntries(STAGES.map((s) => [s.key, s])));

const STAGE_BY_APPROVAL = Object.fromEntries(STAGES.filter((s) => s.approval != null).map((s) => [s.approval, s.key]));

/** Stage key for a profile/grant pair. A grant with an unknown approval state counts as pending. */
export function stageOf(grant) {
  if (!grant) return 'terms';
  return STAGE_BY_APPROVAL[grant.isApproved] || 'pending';
}

/** "A" | "B" | "C" | null — the backend sends either the letter or the full enum. */
export function classLetter(profile, grant) {
  const raw = profile?.fundClass || grant?.fundClassCode || null;
  if (!raw) return null;
  return FUND_CLASS_SHORT[raw] || (['A', 'B', 'C'].includes(raw) ? raw : null);
}

/** Total of a profile's disbursement rules (its committed schedule). */
export function profileCommitted(profile) {
  return (profile?.disbursementRules || []).reduce((sum, rule) => sum + (Number(rule.totalAmount) || 0), 0);
}

function toRecord(profile, grant) {
  const hasSchedule = Boolean(profile?.disbursementRules?.length);
  const committed = grant ? Number(grant.totalGrantAmount) || 0 : profileCommitted(profile);
  return {
    key: profile ? `fp-${profile.id}` : `ga-${grant.id}`,
    profile,
    grant,
    profileId: profile?.id ?? null,
    grantId: grant?.id ?? null,
    profileCode: profile?.profileCode || null,
    grantCode: grant?.grantCode || null,
    donorId: profile?.donorId ?? grant?.donorId ?? null,
    donorName: profile?.donorName || grant?.donorName || '—',
    title: grant?.agreementName || profile?.purpose || null,
    programmeName: profile?.programmeName || null,
    classCode: classLetter(profile, grant),
    committed,
    hasSchedule: grant ? true : hasSchedule,
    startDate: grant?.startDate || null,
    endDate: grant?.endDate || null,
    stage: stageOf(grant),
    // Legacy grants with no linked profile still open in the old grant view.
    href: profile ? `/funding/${profile.id}` : `/grants/${grant.id}`,
  };
}

/**
 * Join fund profiles with grant agreements into one list of funding records.
 * Every profile yields a record (with its grant, if one exists); grants whose
 * profile isn't in the list are kept as standalone records so nothing is hidden.
 */
export function buildFundingRecords(profiles = [], grants = []) {
  const grantByProfile = new Map();
  for (const grant of grants) {
    if (grant.fundProfileId != null) grantByProfile.set(String(grant.fundProfileId), grant);
  }
  const profileIds = new Set(profiles.map((p) => String(p.id)));

  const records = profiles.map((profile) => toRecord(profile, grantByProfile.get(String(profile.id)) || null));
  for (const grant of grants) {
    if (grant.fundProfileId == null || !profileIds.has(String(grant.fundProfileId))) {
      records.push(toRecord(null, grant));
    }
  }
  return records;
}

/** Count of records per stage key (every stage present, zero when empty). */
export function countByStage(records) {
  const counts = Object.fromEntries(STAGES.map((s) => [s.key, 0]));
  for (const record of records) counts[record.stage] += 1;
  return counts;
}

/** Case-insensitive match across the fields a user is likely to type. */
export function matchesSearch(record, term) {
  const needle = term.trim().toLowerCase();
  if (!needle) return true;
  return [record.profileCode, record.grantCode, record.donorName, record.title, record.programmeName]
    .some((value) => value && String(value).toLowerCase().includes(needle));
}

/** FP-2026-014 / ZRY/GA/2026/007 → sortable number, newest highest. */
export function codeSortValue(record) {
  const fp = /^FP-(\d{4})-(\d+)$/.exec(record.profileCode || '');
  if (fp) return Number(fp[1]) * 1_000_000 + Number(fp[2]);
  const ga = /(\d{4})\/(\d+)$/.exec(record.grantCode || '');
  return ga ? Number(ga[1]) * 1_000_000 + Number(ga[2]) : null;
}
