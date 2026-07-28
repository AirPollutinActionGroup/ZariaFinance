/**
 * FundProfileMapper — FundProfileResponse ↔ view / form models. Backend field
 * names are preserved; the mapper attaches display labels and normalises the
 * nested rule collections for the form.
 *
 * The UI exposes exactly one disbursement schedule per profile (one "Total
 * amount committed" / disbursement type block), while the backend models
 * disbursementRules as a list — this mapper always reads/writes element [0].
 */

const FUND_MODE_LABEL = { Restricted: 'Restricted', Unrestricted: 'Unrestricted' };

/** A/B/C restriction class → human label (distinct from the donor typology). */
export const FUND_CLASS_CODE_LABEL = {
  A: 'Class A · Fully restricted',
  B: 'Class B · Unrestricted w/ explanation',
  C: 'Class C · Fully unrestricted',
};

/** Σ of the disbursement schedule's tranche amounts — the grant's total amount. */
function plannedTotalAmount(disbursementRules) {
  const tranches = (disbursementRules || [])[0]?.trancheDetail || [];
  return tranches.reduce((sum, t) => {
    const amount = Number(t.amount);
    return Number.isFinite(amount) ? sum + amount : sum;
  }, 0);
}

/** FundProfileResponse → view model. */
export function fromFundProfileResponse(dto) {
  const disbursementRules = dto.disbursementRules || [];
  return {
    ...dto,
    fundModeLabel: FUND_MODE_LABEL[dto.fundMode] || dto.fundMode || '—',
    fundClassLabel: FUND_CLASS_CODE_LABEL[dto.fundClassCode] || dto.fundClassCode || '—',
    spendableLocations: dto.spendableLocations || [],
    utilisationRules: dto.utilisationRules || [],
    disbursementRules,
    plannedTotalAmount: plannedTotalAmount(disbursementRules),
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

/** Only the fields belonging to a tranche's release criterion are sent. */
function trancheToRequest(t, frequency) {
  const payload = {
    amount: String(t.amount),
    frequency,
    isFinalTranche: Boolean(t.isFinalTranche),
    releaseCriteria: t.releaseCriteria,
    releaseDate: null,
    milestoneName: null,
    signOfRole: null,
    otherSignOfRole: null,
    targetDate: null,
    utilisationPercentage: null,
    triggerBase: null,
    description: null,
    responsibleRole: null,
    otherResponsibleRole: null,
    reminderLeadTime: null,
    repeatReminder: null,
    escalateToDeputy: false,
  };

  switch (t.releaseCriteria) {
    case 'FIXED_DATE':
      payload.releaseDate = trimOrNull(t.releaseDate);
      break;
    case 'MILESTONE_BASED':
      payload.milestoneName = trimOrNull(t.milestoneName);
      payload.signOfRole = t.signOfRole || null;
      payload.otherSignOfRole = trimOrNull(t.otherSignOfRole);
      payload.targetDate = trimOrNull(t.targetDate);
      break;
    case 'UTILISATION_THRESHOLD':
      payload.utilisationPercentage = t.utilisationPercentage != null ? String(t.utilisationPercentage) : null;
      payload.triggerBase = t.triggerBase || null;
      payload.description = trimOrNull(t.description);
      break;
    case 'OTHER':
      payload.description = trimOrNull(t.description);
      break;
    default:
      break;
  }

  if (t.hasReminder) {
    payload.responsibleRole = t.responsibleRole || null;
    payload.otherResponsibleRole = trimOrNull(t.otherResponsibleRole);
    payload.reminderLeadTime = t.reminderLeadTime != null ? String(t.reminderLeadTime) : null;
    payload.repeatReminder = t.repeatReminder || null;
    payload.escalateToDeputy = Boolean(t.escalateToDeputy);
  }

  return payload;
}

function buildDisbursementRule(values) {
  const isLumpSum = values.disbursementType !== 'TRANCHE';
  const trancheDetail = isLumpSum
    ? [{
        amount: String(values.totalAmountCommitted),
        frequency: 'ONE_TIME',
        isFinalTranche: true,
        releaseCriteria: 'FIXED_DATE',
        releaseDate: trimOrNull(values.receivingDate),
      }]
    : (values.tranches || []).map((t) => trancheToRequest(t, values.scheduleType));

  return {
    totalAmountCommitted: String(values.totalAmountCommitted),
    disbursementType: isLumpSum ? 'LUMP_SUM' : 'TRANCHE',
    trancheDetail,
  };
}

/** Form values → CreateFundProfileRequest. */
export function toFundProfileRequest(values) {
  return {
    fundMode: values.fundMode,
    fundClassCode: values.fundClassCode || null,
    purpose: trimOrNull(values.purpose),
    programmeTied: Boolean(values.programmeTied),
    programmeId: values.programmeId ? Number(values.programmeId) : null,
    reportingFrequency: values.reportingFrequency || null,
    movementAllowed: Boolean(values.movementAllowed),
    explanationRequired: Boolean(values.explanationRequired),
    onboardingComplete: Boolean(values.onboardingComplete),
    stateIds: (values.selectedGeographies || [])
      .filter((g) => g !== 'ALL')
      .map(numOrNull)
      .filter((id) => id !== null),
    utilisationRules: (values.utilisationRules || [])
      .filter((r) => (r.ruleType || '').trim())
      .map((r) => ({
        ruleType: r.ruleType,
        otherRuleType: trimOrNull(r.otherRuleType),
        limitPercentage: numOrNull(r.limitPercentage),
        description: trimOrNull(r.description),
      })),
    disbursementRules: values.totalAmountCommitted ? [buildDisbursementRule(values)] : [],
  };
}

function trancheToFormValues(t) {
  return {
    amount: t.amount ?? '',
    trancheName: '',
    isFinalTranche: Boolean(t.isFinalTranche),
    releaseCriteria: t.releaseCriteria || '',
    releaseDate: t.releaseDate || '',
    milestoneName: t.milestoneName || '',
    signOfRole: t.signOfRole || '',
    otherSignOfRole: t.otherSignOfRole || '',
    targetDate: t.targetDate || '',
    utilisationPercentage: t.utilisationPercentage ?? '',
    triggerBase: t.triggerBase || '',
    description: t.description || '',
    hasReminder: Boolean(t.responsibleRole || t.reminderLeadTime),
    responsibleRole: t.responsibleRole || '',
    otherResponsibleRole: t.otherResponsibleRole || '',
    reminderLeadTime: t.reminderLeadTime ?? '',
    repeatReminder: t.repeatReminder || 'ONCE',
    escalateToDeputy: Boolean(t.escalateToDeputy),
  };
}

/** FundProfileResponse → form default values for the edit screen. */
export function toFundProfileFormValues(dto) {
  const rule = (dto.disbursementRules || [])[0];
  const isLumpSum = !rule || rule.disbursementType === 'LUMP_SUM';
  const tranches = rule?.trancheDetail || [];

  return {
    fundMode: dto.fundMode || 'Restricted',
    fundClassCode: dto.fundClassCode || '',
    purpose: dto.purpose || '',
    programmeTied: Boolean(dto.programmeTied),
    programmeId: dto.programmeId || '',
    reportingFrequency: dto.reportingFrequency || '',
    movementAllowed: dto.movementAllowed ?? false,
    explanationRequired: dto.explanationRequired ?? false,
    onboardingComplete: dto.onboardingComplete ?? false,
    selectedGeographies: (dto.spendableLocations || []).map((l) => l.stateId),
    utilisationRules: (dto.utilisationRules || []).map((r) => ({
      ruleType: r.ruleType,
      otherRuleType: r.otherRuleType || '',
      limitPercentage: r.limitPercentage ?? '',
      description: r.description || '',
    })),
    disbursementType: isLumpSum ? 'LUMP_SUM' : 'TRANCHE',
    totalAmountCommitted: rule?.totalAmountCommitted ?? '',
    receivingDate: isLumpSum ? (tranches[0]?.releaseDate || '') : '',
    scheduleType: !isLumpSum ? (tranches[0]?.frequency || '') : '',
    tranches: !isLumpSum ? tranches.map(trancheToFormValues) : [],
  };
}
