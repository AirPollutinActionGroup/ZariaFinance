/**
 * The fund suggestion weights in display order, with the same limits the
 * backend enforces (UpdateFundSuggestionWeightsRequest).
 */
export const WEIGHT_FIELDS = [
  { key: 'programmeMatch', label: 'Same programme as the budget', min: 0, max: 100, unit: 'pts' },
  { key: 'coversAmount', label: 'Covers the full amount', min: 0, max: 100, unit: 'pts' },
  { key: 'restrictedForProgramme', label: 'Restricted (Class A) for this programme', min: 0, max: 100, unit: 'pts' },
  { key: 'expiryMax', label: 'Grant ending soon (most points)', min: 0, max: 100, unit: 'pts' },
  { key: 'hasGrant', label: 'Backed by a grant agreement', min: 0, max: 100, unit: 'pts' },
  { key: 'unrestricted', label: 'Unrestricted (Class B / C) fund', min: -100, max: 0, unit: 'pts' },
  { key: 'expiryWindowDays', label: 'Grant ending soon — window', min: 1, max: 730, unit: 'days' },
];

const BONUS_KEYS = ['programmeMatch', 'coversAmount', 'restrictedForProgramme', 'expiryMax', 'hasGrant'];

/** Field → error message, or {} when the weights can be saved. */
export function validateWeights(values) {
  const errors = {};
  WEIGHT_FIELDS.forEach(({ key, min, max }) => {
    const raw = values[key];
    const n = Number(raw);
    if (raw === '' || raw == null || !Number.isInteger(n)) errors[key] = 'Whole number required';
    else if (n < min || n > max) errors[key] = `Must be ${min} to ${max}`;
  });
  if (!errors.programmeMatch && BONUS_KEYS.every((k) => Number(values[k]) === 0)) {
    errors.programmeMatch = 'At least one bonus must be above zero';
  }
  if (!String(values.reason || '').trim()) errors.reason = 'Give a reason for the change';
  return errors;
}

/** Highest score a fund can reach with these weights. */
export const maxScore = (w) => BONUS_KEYS.reduce((sum, k) => sum + (Number(w[k]) || 0), 0);

/** One-line summary for the suggestions dialog footer. */
export function describeWeights(w) {
  if (!w) return '';
  const sign = (n) => (n > 0 ? `+${n}` : n < 0 ? `−${-n}` : '0');
  return [
    `programme ${sign(w.programmeMatch)}`,
    `covers amount ${sign(w.coversAmount)}`,
    `restricted for programme ${sign(w.restrictedForProgramme)}`,
    `grant ending within ${w.expiryWindowDays} days up to ${sign(w.expiryMax)}`,
    `has grant ${sign(w.hasGrant)}`,
    `unrestricted ${sign(w.unrestricted)}`,
  ].join(' · ');
}
