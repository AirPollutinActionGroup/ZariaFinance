/**
 * FundProfileMapper — FundProfileResponse ↔ view / form models. Backend field
 * names are preserved; the mapper attaches display labels and normalises the
 * nested rule collections for the form.
 */

const FUND_MODE_LABEL = { Restricted: 'Restricted', Unrestricted: 'Unrestricted' };

/** A/B/C restriction class → human label (distinct from the donor typology). */
export const FUND_CLASS_CODE_LABEL = {
  A: 'Class A · Fully restricted',
  B: 'Class B · Unrestricted w/ explanation',
  C: 'Class C · Fully unrestricted',
};

/** FundProfileResponse → view model. */
export function fromFundProfileResponse(dto) {
  return {
    ...dto,
    fundModeLabel: FUND_MODE_LABEL[dto.fundMode] || dto.fundMode || '—',
    fundClassLabel: FUND_CLASS_CODE_LABEL[dto.fundClassCode] || dto.fundClassCode || '—',
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

/** Form values → CreateFundProfileRequest. */
export function toFundProfileRequest(values) {
  return {
    fundMode: values.fundMode,
    fundClassCode: values.fundClassCode || null,
    purpose: trimOrNull(values.purpose),
    programmeTied: Boolean(values.programmeTied),
    programmeId: values.programmeId ? Number(values.programmeId) : null,
    reportingFrequency: trimOrNull(values.reportingFrequency),
    adminAllowed: Boolean(values.adminAllowed),
    overheadLimitPercent: numOrNull(values.overheadLimitPercent),
    movementAllowed: Boolean(values.movementAllowed),
    explanationRequired: Boolean(values.explanationRequired),
    onboardingComplete: Boolean(values.onboardingComplete),
    geographies: (values.geographies || [])
      .map((g) => ({ geographyName: (g.geographyName || '').trim() }))
      .filter((g) => g.geographyName),
    utilisationRules: (values.utilisationRules || [])
      .filter((r) => (r.ruleType || '').trim())
      .map((r) => ({
        ruleType: r.ruleType.trim(),
        limitPercentage: numOrNull(r.limitPercentage),
        description: trimOrNull(r.description),
      })),
    disbursementRules: (values.disbursementRules || [])
      .filter((r) => (r.ruleType || '').trim())
      .map((r) => ({
        ruleType: r.ruleType.trim(),
        releaseTrigger: trimOrNull(r.releaseTrigger),
        minPriorUtilisationRequired: numOrNull(r.minPriorUtilisationRequired),
        milestoneRequired: Boolean(r.milestoneRequired),
        ruleDescription: trimOrNull(r.ruleDescription),
      })),
  };
}

/** FundProfileResponse → form default values for the edit screen. */
export function toFundProfileFormValues(dto) {
  return {
    fundMode: dto.fundMode || 'Restricted',
    fundClassCode: dto.fundClassCode || '',
    purpose: dto.purpose || '',
    programmeTied: Boolean(dto.programmeTied),
    programmeId: dto.programmeId || '',
    reportingFrequency: dto.reportingFrequency || '',
    adminAllowed: dto.adminAllowed ?? true,
    overheadLimitPercent: dto.overheadLimitPercent ?? '',
    movementAllowed: dto.movementAllowed ?? false,
    explanationRequired: dto.explanationRequired ?? false,
    onboardingComplete: dto.onboardingComplete ?? false,
    geographies: (dto.geographies || []).map((g) => ({ geographyName: g.geographyName })),
    utilisationRules: (dto.utilisationRules || []).map((r) => ({
      ruleType: r.ruleType,
      limitPercentage: r.limitPercentage ?? '',
      description: r.description || '',
    })),
    disbursementRules: (dto.disbursementRules || []).map((r) => ({
      ruleType: r.ruleType,
      releaseTrigger: r.releaseTrigger || '',
      minPriorUtilisationRequired: r.minPriorUtilisationRequired ?? '',
      milestoneRequired: Boolean(r.milestoneRequired),
      ruleDescription: r.ruleDescription || '',
    })),
  };
}
