import { describe, expect, it } from 'vitest';
import { buildFundingRecords, countByStage, matchesSearch, stageOf } from './fundingRecords.js';

const profile = (id, extra = {}) => ({
  id,
  profileCode: `FP-2026-00${id}`,
  donorId: 10,
  donorName: 'Clean Air Trust',
  fundClass: 'CLASS_A_RESTRICTED',
  purpose: 'Monitoring network',
  disbursementRules: [{ totalAmount: 500 }],
  ...extra,
});

describe('stageOf', () => {
  it('is "terms" when there is no grant', () => {
    expect(stageOf(null)).toBe('terms');
  });

  it('maps the approval workflow state', () => {
    expect(stageOf({ isApproved: 1 })).toBe('approved');
    expect(stageOf({ isApproved: 2 })).toBe('pending');
    expect(stageOf({ isApproved: 3 })).toBe('onhold');
    expect(stageOf({ isApproved: 4 })).toBe('completed');
    expect(stageOf({ isApproved: undefined })).toBe('pending');
  });
});

describe('buildFundingRecords', () => {
  it('joins each profile with the grant built on it', () => {
    const records = buildFundingRecords(
      [profile(1), profile(2)],
      [{ id: 7, fundProfileId: 1, grantCode: 'ZRY/GA/2026/007', agreementName: 'AQ grant', totalGrantAmount: 900, isApproved: 1 }],
    );
    expect(records).toHaveLength(2);
    expect(records[0]).toMatchObject({ grantCode: 'ZRY/GA/2026/007', title: 'AQ grant', committed: 900, stage: 'approved', classCode: 'A' });
    expect(records[1]).toMatchObject({ grantCode: null, title: 'Monitoring network', committed: 500, stage: 'terms', href: '/funding/2' });
  });

  it('keeps grants whose profile is missing as standalone records', () => {
    const records = buildFundingRecords([], [{ id: 3, fundProfileId: null, donorName: 'X', fundClassCode: 'B', isApproved: 2 }]);
    expect(records).toEqual([expect.objectContaining({ key: 'ga-3', href: '/grants/3', classCode: 'B', stage: 'pending' })]);
  });

  it('counts records per stage', () => {
    const records = buildFundingRecords([profile(1), profile(2)], [{ id: 1, fundProfileId: 2, isApproved: 4 }]);
    expect(countByStage(records)).toMatchObject({ terms: 1, completed: 1, approved: 0 });
  });
});

describe('matchesSearch', () => {
  it('matches codes, donor and title case-insensitively', () => {
    const [record] = buildFundingRecords([profile(1)], []);
    expect(matchesSearch(record, 'clean air')).toBe(true);
    expect(matchesSearch(record, 'fp-2026-001')).toBe(true);
    expect(matchesSearch(record, 'nothing')).toBe(false);
    expect(matchesSearch(record, '  ')).toBe(true);
  });
});
