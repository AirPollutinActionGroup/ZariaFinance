/**
 * FundProfileMapper — FundProfileResponse ↔ view / form models.
 *
 * The backend's disbursementRules/trancheCriteria are one level deeper and
 * differently-named than the form's flat disbursementType/totalAmount/frequency
 * + tranches[] shape (see fundProfileSchema.js / FundProfileFormPage.jsx): a
 * profile has at most one meaningful disbursement rule, and each
 * DonorTrancheCriterion row carries its own amount/date plus a criteria[] list
 * (a tranche can have more than one release gate — mirrors tranches[].criteria[]
 * on the form and DonorReleaseCriteria on the backend).
 */

const FUND_MODE_LABEL = { RESTRICTED: 'Restricted', UNRESTRICTED: 'Unrestricted' };

/** A/B/C restriction class → human label (distinct from the donor typology). */
export const FUND_CLASS_LABEL = {
  CLASS_A_RESTRICTED: 'Class A · Fully restricted',
  CLASS_B_UNRESTRICTED: 'Class B · Unrestricted w/ explanation',
  CLASS_C_UNRESTRICTED: 'Class C · Fully unrestricted',
};

/** FundProfileResponse → view model (donor detail / list display). */
export function fromFundProfileResponse(dto) {
  return {
    ...dto,
    fundModeLabel: FUND_MODE_LABEL[dto.fundMode] || dto.fundMode || '—',
    fundClassLabel: dto.fundClassLabel || FUND_CLASS_LABEL[dto.fundClass] || dto.fundClass || '—',
    geographies: dto.geographies || [],
    utilisationRules: dto.utilisationRules || [],
    disbursementRules: dto.disbursementRules || [],
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

/** One form criterion → a ReleaseCriterionItem. */
function toReleaseCriterionItem(c) {
  return {
    id: c.id ?? null,
    releaseCriteria: c.criterionType || null,
    releaseDate: trimOrNull(c.releaseDate),
    milestoneName: trimOrNull(c.milestoneName),
    verificationSignOffRole: trimOrNull(c.verificationRole),
    otherVerificationSignOffRole: trimOrNull(c.otherVerificationRole),
    targetDate: trimOrNull(c.targetDate),
    utilisationPercentage: numOrNull(c.utilisationPercent),
    triggerBasis: trimOrNull(c.triggerBasis),
    description: trimOrNull(c.description),
    remindSomeone: Boolean(c.hasReminder),
    responsibleRole: c.hasReminder ? trimOrNull(c.reminder?.responsibleRole) : null,
    otherResponsibleRole: c.hasReminder ? trimOrNull(c.reminder?.otherResponsibleRole) : null,
    reminderLeadTime: c.hasReminder ? numOrNull(c.reminder?.reminderLeadDays) : null,
    repeatReminder: c.hasReminder ? (c.reminder?.repeatReminder || 'ONCE') : null,
    escalateToDeputy: c.hasReminder ? Boolean(c.reminder?.escalateToDeputy) : null,
  };
}

/** One tranche row (amount/date + all its criteria) → a trancheCriteria item. */
function toTrancheCriterionItem(t, frequency) {
  return {
    amountCriteria: numOrNull(t.amount),
    expectedReleaseDate: trimOrNull(t.expectedReleaseDate),
    frequency: frequency || 'MONTHLY',
    isFinalTranche: Boolean(t.isFinal),
    criteria: (t.criteria || []).map(toReleaseCriterionItem),
  };
}

/** The inverse of toReleaseCriterionItem: a ReleaseCriterionItem → a form criterion. */
function toCriterionFormValue(c) {
  return {
    id: c.id ?? null,
    criterionType: c.releaseCriteria || '',
    releaseDate: c.releaseDate || '',
    milestoneName: c.milestoneName || '',
    verificationRole: c.verificationSignOffRole || '',
    otherVerificationRole: c.otherVerificationSignOffRole || '',
    targetDate: c.targetDate || '',
    utilisationPercent: c.utilisationPercentage ?? '',
    triggerBasis: c.triggerBasis || '',
    description: c.description || '',
    hasReminder: Boolean(c.remindSomeone),
    reminder: {
      responsibleRole: c.responsibleRole || '',
      otherResponsibleRole: c.otherResponsibleRole || '',
      reminderLeadDays: c.reminderLeadTime ?? '',
      repeatReminder: c.repeatReminder || 'ONCE',
      escalateToDeputy: c.escalateToDeputy ?? true,
    },
  };
}

/** The inverse of toTrancheCriterionItem: a trancheCriteria item → a tranche row. */
function toTrancheFormValue(c) {
  return {
    amount: c.amountCriteria ?? '',
    expectedReleaseDate: c.expectedReleaseDate || '',
    isFinal: Boolean(c.isFinalTranche),
    criteria: (c.criteria || []).map(toCriterionFormValue),
  };
}

/** Form values → CreateFundProfileRequest. */
export function toFundProfileRequest(values) {
  const geographies =
    (values.selectedGeographies || []).length === 0 || values.selectedGeographies.includes('ALL')
      ? []
      : values.selectedGeographies.map((stateId) => ({ stateId: Number(stateId) }));

  const utilisationRules = (values.utilisationRules || [])
    .filter((r) => (r.ruleType || '').trim())
    .map((r) => ({
      ruleType: r.ruleType,
      otherRuleType: r.ruleType === 'OTHER_CUSTOM' ? trimOrNull(r.otherRuleType) : null,
      limitPercentage: numOrNull(r.limitPercentage),
      description: trimOrNull(r.description),
    }));

  const disbursementActive = !isBlank(values.totalAmount) || (values.tranches || []).length > 0;
  const disbursementRules = disbursementActive
    ? [
        {
          totalAmount: numOrNull(values.totalAmount),
          disbursementType: values.disbursementType,
          trancheCriteria:
            values.disbursementType === 'LUMP_SUM'
              ? [
                  {
                    amountCriteria: numOrNull(values.totalAmount),
                    expectedReleaseDate: trimOrNull(values.receivingDate),
                    frequency: 'MONTHLY',
                    isFinalTranche: true,
                    releaseCriteria: 'ON_SIGNING',
                  },
                ]
              : (values.tranches || []).map((t) => toTrancheCriterionItem(t, values.frequency)),
        },
      ]
    : [];

  return {
    fundMode: values.fundMode,
    fundClass: values.fundClass || null,
    purpose: trimOrNull(values.purpose),
    programmeTied: Boolean(values.programmeTied),
    programmeId: values.programmeId ? Number(values.programmeId) : null,
    reportingFrequency: values.reportingFrequency || null,
    movementAllowed: Boolean(values.movementAllowed),
    explanationRequired: Boolean(values.explanationRequired),
    onboardingComplete: Boolean(values.onboardingComplete),
    geographies,
    utilisationRules,
    disbursementRules,
  };
}

function isBlank(v) {
  return v === undefined || v === null || v === '';
}

/** FundProfileResponse → form default values for the edit screen. */
export function toFundProfileFormValues(dto) {
  const rule = (dto.disbursementRules || [])[0] || null;
  const trancheCriteria = rule?.trancheCriteria || [];
  const lumpSum = rule?.disbursementType === 'LUMP_SUM';

  return {
    fundMode: dto.fundMode || 'RESTRICTED',
    fundClass: dto.fundClass || '',
    purpose: dto.purpose || '',
    programmeTied: Boolean(dto.programmeTied),
    programmeId: dto.programmeId || '',
    reportingFrequency: dto.reportingFrequency || '',
    movementAllowed: Boolean(dto.movementAllowed),
    explanationRequired: Boolean(dto.explanationRequired),
    onboardingComplete: Boolean(dto.onboardingComplete),
    selectedGeographies: (dto.geographies || []).map((g) => g.stateId),
    utilisationRules: (dto.utilisationRules || []).map((r) => ({
      ruleType: r.ruleType,
      otherRuleType: r.otherRuleType || '',
      limitPercentage: r.limitPercentage ?? '',
      description: r.description || '',
    })),
    disbursementType: rule?.disbursementType || 'LUMP_SUM',
    totalAmount: rule?.totalAmount ?? '',
    frequency: trancheCriteria[0]?.frequency || 'QUARTERLY',
    receivingDate: lumpSum ? (trancheCriteria[0]?.expectedReleaseDate || '') : '',
    tranches: lumpSum ? [] : trancheCriteria.map(toTrancheFormValue),
  };
}
