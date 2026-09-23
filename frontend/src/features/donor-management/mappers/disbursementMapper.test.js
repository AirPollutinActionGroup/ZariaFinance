import { describe, expect, it } from 'vitest';
import { isHumanActioned } from './disbursementMapper.js';

describe('disbursementMapper', () => {
  describe('isHumanActioned', () => {
    it('marks the six criteria a person has to action', () => {
      for (const type of [
        'MILESTONE_BASED',
        'UTILISATION_CERTIFICATE',
        'FINANCIAL_REPORT',
        'NARRATIVE_REPORT',
        'AUDIT_REPORT',
        'DONOR_APPROVAL',
      ]) {
        expect(isHumanActioned(type)).toBe(true);
      }
    });

    it('excludes the automatic and instant ones', () => {
      // A reminder here would never fire: the system checks the threshold itself,
      // signing is instant, and a fixed date needs no chasing.
      expect(isHumanActioned('UTILISATION_THRESHOLD')).toBe(false);
      expect(isHumanActioned('ON_SIGNING')).toBe(false);
      expect(isHumanActioned('FIXED_DATE')).toBe(false);
      expect(isHumanActioned('OTHER')).toBe(false);
    });
  });
});
