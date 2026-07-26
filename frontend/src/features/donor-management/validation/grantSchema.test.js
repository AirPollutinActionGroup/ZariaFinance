import { describe, expect, it } from 'vitest';
import { grantSchema } from './grantSchema.js';

const valid = {
  grantCode: 'GR-1',
  donorId: '1',
  fundProfileId: '2',
  programmeId: '4',
  agreementName: 'Clean Air',
  status: 'ACTIVE',
  agreementDate: '2026-01-01',
  startDate: '2026-02-01',
  endDate: '2026-12-31',
  grantCurrency: 'INR',
  fxLockedRate: '1',
  approvalStatus: '2',
  approvedBy: '',
  approvalDate: '',
  approvalRemarks: '',
  description: '',
  agreementDocumentPath: '',
};

describe('grantSchema', () => {
  it('accepts a valid grant', () => {
    expect(grantSchema.safeParse(valid).success).toBe(true);
  });

  it('rejects end date before start date (mirrors @ValidGrantDates)', () => {
    const result = grantSchema.safeParse({ ...valid, endDate: '2026-01-15' });
    expect(result.success).toBe(false);
    expect(result.error.issues[0].path).toEqual(['endDate']);
  });

  it('rejects non-positive FX rates', () => {
    expect(grantSchema.safeParse({ ...valid, fxLockedRate: '0' }).success).toBe(false);
    expect(grantSchema.safeParse({ ...valid, fxLockedRate: '-5' }).success).toBe(false);
  });

  it('rejects a missing fund profile', () => {
    expect(grantSchema.safeParse({ ...valid, fundProfileId: '' }).success).toBe(false);
  });

  it('requires a programme (all programme codes, no inherit option)', () => {
    expect(grantSchema.safeParse({ ...valid, programmeId: '' }).success).toBe(false);
  });

  it('requires an agreement status of Active / Completed / Cancelled', () => {
    expect(grantSchema.safeParse({ ...valid, status: 'COMPLETED' }).success).toBe(true);
    expect(grantSchema.safeParse({ ...valid, status: 'CANCELLED' }).success).toBe(true);
    expect(grantSchema.safeParse({ ...valid, status: '' }).success).toBe(false);
    expect(grantSchema.safeParse({ ...valid, status: 'CLOSED' }).success).toBe(false);
  });

  it('ignores the total grant amount — it is inherited from the fund profile', () => {
    // Nothing the form sends can set it, so a stray value must not fail parsing.
    expect(grantSchema.safeParse({ ...valid, totalGrantAmount: '0' }).success).toBe(true);
  });

  describe('approval block', () => {
    it('accepts a pending grant with no approver', () => {
      expect(grantSchema.safeParse({ ...valid, approvalStatus: '2' }).success).toBe(true);
    });

    it('requires approver and date once approved', () => {
      const result = grantSchema.safeParse({ ...valid, approvalStatus: '1' });
      expect(result.success).toBe(false);
      expect(result.error.issues.map((i) => i.path[0])).toEqual(
        expect.arrayContaining(['approvedBy', 'approvalDate']),
      );
    });

    it('accepts an approved grant with approver and date', () => {
      const result = grantSchema.safeParse({
        ...valid,
        approvalStatus: '1',
        approvedBy: '3',
        approvalDate: '2026-01-20',
      });
      expect(result.success).toBe(true);
    });

    it('rejects an approval status outside the workflow states', () => {
      expect(grantSchema.safeParse({ ...valid, approvalStatus: '9' }).success).toBe(false);
    });
  });
});
