/**
 * DisbursementMapper — DisbursementScheduleResponse ↔ form values.
 *
 * Form state keeps every scalar as a string (as elsewhere in this codebase) and
 * only the ids stay numeric-or-null, because the backend matches tranches and
 * criteria by id to preserve recorded receipts and met criteria.
 */

export const DISBURSEMENT_TYPES = [
  { value: 'LUMP_SUM', label: 'Lump Sum' },
  { value: 'TRANCHES', label: 'Tranches' },
];

export const SCHEDULE_TYPES = [
  { value: 'MONTHLY', label: 'Monthly' },
  { value: 'QUARTERLY', label: 'Quarterly' },
  { value: 'HALF_YEARLY', label: 'Half-Yearly' },
  { value: 'YEARLY', label: 'Yearly' },
];

/** Criterion types, in the order the spec lists them. */
export const CRITERION_TYPES = [
  { value: 'ON_SIGNING', label: 'On Signing', humanActioned: false },
  { value: 'FIXED_DATE', label: 'Fixed Date', humanActioned: false },
  { value: 'MILESTONE_BASED', label: 'Milestone Based', humanActioned: true },
  { value: 'UTILISATION_THRESHOLD', label: 'Utilisation Threshold', humanActioned: true },
  { value: 'UTILISATION_CERTIFICATE', label: 'Utilisation Certificate (UC)', humanActioned: true },
  { value: 'FINANCIAL_REPORT', label: 'Financial Report', humanActioned: true },
  { value: 'NARRATIVE_REPORT', label: 'Narrative Report', humanActioned: true },
  { value: 'AUDIT_REPORT', label: 'Audit Report', humanActioned: true },
  { value: 'DONOR_APPROVAL', label: 'Donor Approval', humanActioned: true },
  { value: 'OTHER', label: 'Other', humanActioned: false },
];

export const VERIFICATION_ROLES = [
  { value: 'PROGRAMME_MANAGER', label: 'Programme Manager' },
  { value: 'CFO', label: 'CFO' },
  { value: 'HEAD_OF_ORGANISATION', label: 'Head of Organisation' },
  { value: 'OTHER', label: 'Other' },
];

export const RESPONSIBLE_ROLES = [
  ...VERIFICATION_ROLES,
  { value: 'ACCOUNTS', label: 'Accounts' },
];

export const TRIGGER_BASES = [
  { value: 'PREVIOUS_TRANCHE', label: 'Previous Tranche' },
  { value: 'CUMULATIVE', label: 'Cumulative' },
];

export const REPEAT_REMINDERS = [
  { value: 'ONCE', label: 'Once' },
  { value: 'EVERY_3_DAYS', label: 'Every 3 days' },
  { value: 'WEEKLY', label: 'Weekly until actioned' },
];

/** Whether a reminder block may be shown for a criterion type. */
export function isHumanActioned(criterionType) {
  return CRITERION_TYPES.find((t) => t.value === criterionType)?.humanActioned ?? false;
}

export function criterionTypeLabel(criterionType) {
  return CRITERION_TYPES.find((t) => t.value === criterionType)?.label || criterionType || '—';
}

/** A blank criterion row for the + Add Criteria action. */
export function emptyCriterion() {
  return {
    id: null,
    criterionType: '',
    releaseDate: '',
    milestoneName: '',
    verificationRole: '',
    targetDate: '',
    utilisationPercent: '',
    triggerBasis: 'PREVIOUS_TRANCHE',
    description: '',
    met: false,
    hasReminder: false,
    reminder: {
      responsibleRole: '',
      reminderLeadDays: '',
      repeatReminder: 'ONCE',
      escalateToDeputy: true,
    },
  };
}

/** A blank tranche card for the + Add Tranche action. */
export function emptyTranche() {
  return {
    id: null,
    trancheName: '',
    amount: '',
    expectedReleaseDate: '',
    received: false,
    criteria: [emptyCriterion()],
  };
}

/** DisbursementScheduleResponse → form values. */
export function toDisbursementFormValues(dto) {
  return {
    disbursementType: dto?.disbursementType || 'TRANCHES',
    receivingDate: dto?.receivingDate || '',
    scheduleType: dto?.scheduleType || '',
    tranches: (dto?.tranches || []).map((t) => ({
      id: t.id ?? null,
      trancheName: t.trancheName || '',
      amount: t.amount != null ? String(t.amount) : '',
      expectedReleaseDate: t.expectedReleaseDate || '',
      received: Boolean(t.received),
      criteria: (t.criteria || []).map((c) => ({
        id: c.id ?? null,
        criterionType: c.criterionType || 'ON_SIGNING',
        releaseDate: c.releaseDate || '',
        milestoneName: c.milestoneName || '',
        verificationRole: c.verificationRole || '',
        targetDate: c.targetDate || '',
        utilisationPercent: c.utilisationPercent != null ? String(c.utilisationPercent) : '',
        triggerBasis: c.triggerBasis || 'PREVIOUS_TRANCHE',
        description: c.description || '',
        met: Boolean(c.met),
        hasReminder: Boolean(c.reminder),
        reminder: {
          responsibleRole: c.reminder?.responsibleRole || '',
          reminderLeadDays: c.reminder?.reminderLeadDays != null
            ? String(c.reminder.reminderLeadDays) : '',
          repeatReminder: c.reminder?.repeatReminder || 'ONCE',
          escalateToDeputy: c.reminder?.escalateToDeputy ?? true,
        },
      })),
    })),
  };
}

const numOrNull = (v) => {
  if (v === undefined || v === null || v === '') return null;
  const n = Number(v);
  return Number.isFinite(n) ? n : null;
};

const trimOrNull = (v) => {
  if (v === undefined || v === null) return null;
  const t = String(v).trim();
  return t === '' ? null : t;
};

/**
 * Form values → DisbursementScheduleRequest.
 *
 * Only the fields belonging to a criterion's type are sent: leaving stale values
 * from a type the user switched away from would trip the server's per-type
 * checks (and the DB's).
 */
export function toDisbursementRequest(values) {
  const lumpSum = values.disbursementType === 'LUMP_SUM';

  return {
    disbursementType: values.disbursementType,
    receivingDate: lumpSum ? values.receivingDate || null : null,
    scheduleType: lumpSum ? null : values.scheduleType || null,
    tranches: (values.tranches || []).map((t) => ({
      id: t.id ?? null,
      trancheName: trimOrNull(t.trancheName),
      amount: numOrNull(t.amount),
      expectedReleaseDate: trimOrNull(t.expectedReleaseDate),
      criteria: (t.criteria || []).map((c) => criterionPayload(c)),
    })),
  };
}

function criterionPayload(c) {
  const payload = {
    id: c.id ?? null,
    criterionType: c.criterionType,
    releaseDate: null,
    milestoneName: null,
    verificationRole: null,
    targetDate: null,
    utilisationPercent: null,
    triggerBasis: null,
    description: null,
    reminder: null,
  };

  switch (c.criterionType) {
    case 'FIXED_DATE':
      payload.releaseDate = trimOrNull(c.releaseDate);
      break;
    case 'MILESTONE_BASED':
      payload.milestoneName = trimOrNull(c.milestoneName);
      payload.verificationRole = trimOrNull(c.verificationRole);
      payload.targetDate = trimOrNull(c.targetDate);
      break;
    case 'UTILISATION_THRESHOLD':
      payload.utilisationPercent = numOrNull(c.utilisationPercent);
      payload.triggerBasis = trimOrNull(c.triggerBasis);
      payload.description = trimOrNull(c.description);
      break;
    case 'OTHER':
      payload.description = trimOrNull(c.description);
      break;
    default:
      // ON_SIGNING and the report / approval types carry no extra fields.
      break;
  }

  if (c.hasReminder && isHumanActioned(c.criterionType)) {
    payload.reminder = {
      responsibleRole: trimOrNull(c.reminder?.responsibleRole),
      reminderLeadDays: numOrNull(c.reminder?.reminderLeadDays),
      repeatReminder: c.reminder?.repeatReminder || 'ONCE',
      escalateToDeputy: Boolean(c.reminder?.escalateToDeputy),
    };
  }

  return payload;
}
