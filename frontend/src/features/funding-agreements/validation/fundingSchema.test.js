import { describe, expect, it } from 'vitest';
import { fundingFormDefaults, fundingSchema } from './fundingSchema.js';

const valid = {
  ...fundingFormDefaults,
  donorId: '4',
  fundClass: 'CLASS_A_RESTRICTED',
  totalAmount: '100000',
  receivingDate: '2026-12-01',
  agreement: {
    ...fundingFormDefaults.agreement,
    agreementDate: '2026-11-01',
    startDate: '2026-12-01',
    endDate: '2027-11-30',
  },
};

const paths = (values) => {
  const result = fundingSchema.safeParse(values);
  return result.success ? [] : result.error.issues.map((i) => i.path.join('.'));
};

describe('fundingSchema', () => {
  it('accepts complete terms + agreement', () => {
    expect(paths(valid)).toEqual([]);
  });

  it('requires a donor and the fund-profile rules', () => {
    expect(paths({ ...valid, donorId: '', fundClass: '' })).toEqual(expect.arrayContaining(['donorId', 'fundClass']));
    // fundProfileSchema's cross-field rules run once its basic fields are valid.
    expect(paths({ ...valid, totalAmount: '' })).toEqual(['totalAmount']);
  });

  it('validates the agreement only when it is being recorded now', () => {
    const blank = { ...valid, agreement: fundingFormDefaults.agreement };
    expect(paths(blank)).toEqual(expect.arrayContaining(['agreement.agreementDate', 'agreement.startDate']));
    expect(paths({ ...blank, withAgreement: false })).toEqual([]);
  });

  it('rejects an end date before the start date', () => {
    expect(paths({ ...valid, agreement: { ...valid.agreement, endDate: '2026-01-01' } })).toEqual(['agreement.endDate']);
  });
});
