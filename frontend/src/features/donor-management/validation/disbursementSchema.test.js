import { describe, expect, it } from 'vitest';
import { disbursementSchema } from './disbursementSchema.js';

const criterion = (overrides = {}) => ({
  id: null,
  criterionType: 'ON_SIGNING',
  releaseDate: '',
  milestoneName: '',
  verificationRole: '',
  targetDate: '',
  utilisationPercent: '',
  triggerBasis: 'PREVIOUS_TRANCHE',
  description: '',
  met: false,
  hasReminder: false,
  reminder: { responsibleRole: '', reminderLeadDays: '', repeatReminder: 'ONCE', escalateToDeputy: true },
  ...overrides,
});

const tranche = (overrides = {}) => ({
  id: null,
  trancheName: 'First',
  amount: '100000',
  expectedReleaseDate: '2026-04-01',
  received: false,
  criteria: [criterion()],
  ...overrides,
});

const valid = {
  disbursementType: 'TRANCHES',
  receivingDate: '',
  scheduleType: 'QUARTERLY',
  tranches: [tranche()],
};

/** Paths of the issues a parse produced, dot-joined. */
const paths = (result) => result.error.issues.map((i) => i.path.join('.'));

describe('disbursementSchema', () => {
  it('accepts a tranche schedule', () => {
    expect(disbursementSchema.safeParse(valid).success).toBe(true);
  });

  it('requires a schedule type for tranches and a receiving date for a lump sum', () => {
    expect(paths(disbursementSchema.safeParse({ ...valid, scheduleType: '' })))
      .toContain('scheduleType');

    const lumpSum = disbursementSchema.safeParse({
      ...valid,
      disbursementType: 'LUMP_SUM',
      scheduleType: '',
      receivingDate: '',
    });
    expect(paths(lumpSum)).toContain('receivingDate');
  });

  it('allows saving a draft with no tranches yet', () => {
    // Picking the cadence and saving is the state you copy a plan into;
    // "at least one tranche" is enforced when finalising.
    expect(disbursementSchema.safeParse({ ...valid, tranches: [] }).success).toBe(true);
  });

  it('rejects a non-positive tranche amount', () => {
    expect(disbursementSchema.safeParse({ ...valid, tranches: [tranche({ amount: '0' })] }).success)
      .toBe(false);
    expect(disbursementSchema.safeParse({ ...valid, tranches: [tranche({ amount: '' })] }).success)
      .toBe(false);
  });

  it('requires every tranche to carry at least one criterion', () => {
    const result = disbursementSchema.safeParse({ ...valid, tranches: [tranche({ criteria: [] })] });
    expect(result.success).toBe(false);
    expect(paths(result)).toContain('tranches.0.criteria');
  });

  describe('mandatory fields per criterion type', () => {
    it('fixed date needs a release date', () => {
      const result = disbursementSchema.safeParse({
        ...valid,
        tranches: [tranche({ criteria: [criterion({ criterionType: 'FIXED_DATE' })] })],
      });
      expect(paths(result)).toContain('tranches.0.criteria.0.releaseDate');
    });

    it('milestone needs a name and a verification role', () => {
      const result = disbursementSchema.safeParse({
        ...valid,
        tranches: [tranche({ criteria: [criterion({ criterionType: 'MILESTONE_BASED' })] })],
      });
      expect(paths(result)).toContain('tranches.0.criteria.0.milestoneName');
      expect(paths(result)).toContain('tranches.0.criteria.0.verificationRole');
    });

    it('milestone target date stays optional — some milestones are event-driven', () => {
      const result = disbursementSchema.safeParse({
        ...valid,
        tranches: [tranche({
          criteria: [criterion({
            criterionType: 'MILESTONE_BASED',
            milestoneName: 'Training done',
            verificationRole: 'CFO',
            targetDate: '',
          })],
        })],
      });
      expect(result.success).toBe(true);
    });

    it('threshold needs a percentage in range and a trigger basis', () => {
      const overHundred = disbursementSchema.safeParse({
        ...valid,
        tranches: [tranche({
          criteria: [criterion({ criterionType: 'UTILISATION_THRESHOLD', utilisationPercent: '120' })],
        })],
      });
      expect(paths(overHundred)).toContain('tranches.0.criteria.0.utilisationPercent');

      const noBasis = disbursementSchema.safeParse({
        ...valid,
        tranches: [tranche({
          criteria: [criterion({
            criterionType: 'UTILISATION_THRESHOLD',
            utilisationPercent: '80',
            triggerBasis: '',
          })],
        })],
      });
      expect(paths(noBasis)).toContain('tranches.0.criteria.0.triggerBasis');
    });

    it('other needs a description', () => {
      const result = disbursementSchema.safeParse({
        ...valid,
        tranches: [tranche({ criteria: [criterion({ criterionType: 'OTHER' })] })],
      });
      expect(paths(result)).toContain('tranches.0.criteria.0.description');
    });

    it('report and approval types need nothing extra', () => {
      for (const type of ['UTILISATION_CERTIFICATE', 'FINANCIAL_REPORT', 'NARRATIVE_REPORT',
        'AUDIT_REPORT', 'DONOR_APPROVAL', 'ON_SIGNING']) {
        const result = disbursementSchema.safeParse({
          ...valid,
          tranches: [tranche({ criteria: [criterion({ criterionType: type })] })],
        });
        expect(result.success, type).toBe(true);
      }
    });
  });

  describe('reminder fields', () => {
    it('are only required once a reminder is switched on', () => {
      const off = disbursementSchema.safeParse({
        ...valid,
        tranches: [tranche({
          criteria: [criterion({ criterionType: 'AUDIT_REPORT', hasReminder: false })],
        })],
      });
      expect(off.success).toBe(true);

      const on = disbursementSchema.safeParse({
        ...valid,
        tranches: [tranche({
          criteria: [criterion({ criterionType: 'AUDIT_REPORT', hasReminder: true })],
        })],
      });
      expect(paths(on)).toContain('tranches.0.criteria.0.reminder.responsibleRole');
      expect(paths(on)).toContain('tranches.0.criteria.0.reminder.reminderLeadDays');
    });

    it('accepts a fully specified reminder', () => {
      const result = disbursementSchema.safeParse({
        ...valid,
        tranches: [tranche({
          criteria: [criterion({
            criterionType: 'DONOR_APPROVAL',
            hasReminder: true,
            reminder: {
              responsibleRole: 'CFO',
              reminderLeadDays: '7',
              repeatReminder: 'EVERY_3_DAYS',
              escalateToDeputy: false,
            },
          })],
        })],
      });
      expect(result.success).toBe(true);
    });
  });
});
