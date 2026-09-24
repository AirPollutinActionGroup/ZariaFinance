/**
 * Shared vocabulary for the fund profile's embedded disbursement plan
 * (Disbursement Schedule section of the Fund Profile form): schedule cadence,
 * release criterion types, and reminder options, plus the criterion-shape
 * helpers used by CriterionFields.jsx / TrancheCard.jsx.
 */

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
  { value: 'UTILISATION_THRESHOLD', label: 'Utilisation Threshold', humanActioned: false },
  { value: 'UTILISATION_CERTIFICATE', label: 'Utilisation Certificate (UC)', humanActioned: true },
  { value: 'FINANCIAL_REPORT', label: 'Financial Report', humanActioned: true },
  { value: 'NARRATIVE_REPORT', label: 'Narrative Report', humanActioned: true },
  { value: 'AUDIT_REPORT', label: 'Audit Report', humanActioned: true },
  { value: 'DONOR_APPROVAL', label: 'Donor Approval', humanActioned: true },
  { value: 'OTHER', label: 'Other', humanActioned: false },
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
    verificationRoleId: '',
    targetDate: '',
    utilisationPercent: '',
    triggerBasis: 'PREVIOUS_TRANCHE',
    description: '',
    met: false,
    hasReminder: false,
    reminder: {
      responsibleRoleId: '',
      reminderLeadDays: '',
      repeatReminder: 'ONCE',
      escalateToDeputy: true,
    },
  };
}
