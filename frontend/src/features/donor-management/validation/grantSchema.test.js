import { describe, expect, it } from 'vitest';
import { grantSchema } from './grantSchema.js';

const valid = {
  grantCode: 'GR-1',
  donorId: '1',
  programmeId: '2',
  agreementName: 'Clean Air',
  agreementDate: '2026-01-01',
  startDate: '2026-02-01',
  endDate: '2026-12-31',
  totalGrantAmount: '100000',
  fundClass: 'DOMESTIC',
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

  it('rejects non-positive amounts (mirrors @Positive)', () => {
    expect(grantSchema.safeParse({ ...valid, totalGrantAmount: '0' }).success).toBe(false);
    expect(grantSchema.safeParse({ ...valid, totalGrantAmount: '-5' }).success).toBe(false);
  });

  it('rejects non-numeric programme ids', () => {
    expect(grantSchema.safeParse({ ...valid, programmeId: 'abc' }).success).toBe(false);
  });
});
