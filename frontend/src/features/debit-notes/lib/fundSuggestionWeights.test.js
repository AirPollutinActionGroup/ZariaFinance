import { describe, expect, it } from 'vitest';
import { describeWeights, maxScore, validateWeights } from './fundSuggestionWeights.js';

const DEFAULTS = {
  programmeMatch: 40,
  coversAmount: 25,
  restrictedForProgramme: 15,
  expiryMax: 15,
  hasGrant: 5,
  unrestricted: -10,
  expiryWindowDays: 90,
};

describe('validateWeights', () => {
  it('accepts the defaults with a reason', () => {
    expect(validateWeights({ ...DEFAULTS, reason: 'Initial' })).toEqual({});
  });

  it('enforces the same limits as the server', () => {
    const errors = validateWeights({ ...DEFAULTS, programmeMatch: 101, unrestricted: 5, expiryWindowDays: 0, hasGrant: 2.5, reason: ' ' });
    expect(errors.programmeMatch).toBe('Must be 0 to 100');
    expect(errors.unrestricted).toBe('Must be -100 to 0');
    expect(errors.expiryWindowDays).toBe('Must be 1 to 730');
    expect(errors.hasGrant).toBe('Whole number required');
    expect(errors.reason).toBeTruthy();
  });

  it('needs at least one bonus above zero', () => {
    const zero = { ...DEFAULTS, programmeMatch: 0, coversAmount: 0, restrictedForProgramme: 0, expiryMax: 0, hasGrant: 0, reason: 'x' };
    expect(validateWeights(zero).programmeMatch).toMatch(/above zero/);
  });
});

describe('maxScore / describeWeights', () => {
  it('sums the bonuses and describes the weights', () => {
    expect(maxScore(DEFAULTS)).toBe(100);
    expect(describeWeights(DEFAULTS)).toContain('programme +40');
    expect(describeWeights(DEFAULTS)).toContain('unrestricted −10');
    expect(describeWeights(DEFAULTS)).toContain('within 90 days up to +15');
  });
});
