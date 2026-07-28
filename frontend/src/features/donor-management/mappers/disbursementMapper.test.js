import { describe, expect, it } from 'vitest';
import {
  isHumanActioned,
  toDisbursementFormValues,
  toDisbursementRequest,
} from './disbursementMapper.js';

const RESPONSE = {
  disbursementType: 'TRANCHES',
  scheduleType: 'QUARTERLY',
  totalAmountCommitted: 250000,
  tranches: [
    {
      id: 11,
      trancheNumber: 1,
      trancheName: 'First',
      amount: 150000,
      expectedReleaseDate: '2026-04-01',
      received: true,
      criteria: [{ id: 21, criterionType: 'ON_SIGNING', met: true }],
    },
    {
      id: 12,
      trancheNumber: 2,
      trancheName: 'Second',
      amount: 100000,
      expectedReleaseDate: null,
      received: false,
      criteria: [
        {
          id: 22,
          criterionType: 'MILESTONE_BASED',
          milestoneName: 'Teacher Training Completed',
          verificationRole: 'PROGRAMME_MANAGER',
          targetDate: '2026-06-01',
          met: false,
          reminder: {
            responsibleRole: 'PROGRAMME_MANAGER',
            reminderLeadDays: 14,
            repeatReminder: 'WEEKLY',
            escalateToDeputy: true,
            dueDate: '2026-06-17',
          },
        },
      ],
    },
  ],
};

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

  describe('toDisbursementFormValues', () => {
    it('maps a saved configuration into form state', () => {
      const values = toDisbursementFormValues(RESPONSE);

      expect(values.disbursementType).toBe('TRANCHES');
      expect(values.scheduleType).toBe('QUARTERLY');
      expect(values.tranches[0].id).toBe(11);
      expect(values.tranches[0].amount).toBe('150000');
      expect(values.tranches[0].received).toBe(true);
      // A final tranche may legitimately have no expected date.
      expect(values.tranches[1].expectedReleaseDate).toBe('');
      expect(values.tranches[1].criteria[0].hasReminder).toBe(true);
      expect(values.tranches[1].criteria[0].reminder.reminderLeadDays).toBe('14');
    });

    it('opens on a blank tranches schedule when nothing is configured', () => {
      const values = toDisbursementFormValues(null);
      expect(values.disbursementType).toBe('TRANCHES');
      expect(values.tranches).toEqual([]);
    });
  });

  describe('toDisbursementRequest', () => {
    it('round-trips ids so receipts and met criteria survive an edit', () => {
      const payload = toDisbursementRequest(toDisbursementFormValues(RESPONSE));
      expect(payload.tranches[0].id).toBe(11);
      expect(payload.tranches[0].criteria[0].id).toBe(21);
      expect(payload.tranches[0].amount).toBe(150000);
    });

    it('sends only the fields belonging to the chosen criterion type', () => {
      const values = toDisbursementFormValues(RESPONSE);
      // Switch the milestone criterion to a threshold, leaving its old values behind.
      values.tranches[1].criteria[0].criterionType = 'UTILISATION_THRESHOLD';
      values.tranches[1].criteria[0].utilisationPercent = '80';
      values.tranches[1].criteria[0].triggerBasis = 'PREVIOUS_TRANCHE';

      const criterion = toDisbursementRequest(values).tranches[1].criteria[0];
      expect(criterion.utilisationPercent).toBe(80);
      expect(criterion.triggerBasis).toBe('PREVIOUS_TRANCHE');
      // Stale milestone fields would trip the server's per-type checks.
      expect(criterion.milestoneName).toBeNull();
      expect(criterion.verificationRole).toBeNull();
      expect(criterion.targetDate).toBeNull();
      // A threshold is auto-checked, so its reminder is dropped too.
      expect(criterion.reminder).toBeNull();
    });

    it('drops a reminder switched off, and keeps one switched on', () => {
      const values = toDisbursementFormValues(RESPONSE);
      values.tranches[1].criteria[0].hasReminder = false;
      expect(toDisbursementRequest(values).tranches[1].criteria[0].reminder).toBeNull();

      values.tranches[1].criteria[0].hasReminder = true;
      const reminder = toDisbursementRequest(values).tranches[1].criteria[0].reminder;
      expect(reminder).toEqual({
        responsibleRole: 'PROGRAMME_MANAGER',
        reminderLeadDays: 14,
        repeatReminder: 'WEEKLY',
        escalateToDeputy: true,
      });
    });

    it('sends a receiving date for a lump sum and a cadence for tranches, never both', () => {
      const tranched = toDisbursementRequest({
        disbursementType: 'TRANCHES',
        scheduleType: 'MONTHLY',
        receivingDate: '2026-05-01',
        tranches: [],
      });
      expect(tranched.scheduleType).toBe('MONTHLY');
      expect(tranched.receivingDate).toBeNull();

      const lumpSum = toDisbursementRequest({
        disbursementType: 'LUMP_SUM',
        scheduleType: 'MONTHLY',
        receivingDate: '2026-05-01',
        tranches: [],
      });
      expect(lumpSum.receivingDate).toBe('2026-05-01');
      expect(lumpSum.scheduleType).toBeNull();
    });
  });
});
