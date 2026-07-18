import { describe, expect, it } from 'vitest';
import { computeDashboardMetrics, fundingClassRows, recentGrants } from './dashboardService.js';

describe('computeDashboardMetrics', () => {
  it('aggregates donors and grants without inventing numbers, excluding Draft records', () => {
    const donors = [
      { id: 1, isActive: true },
      { id: 2, isActive: false },
      { id: 3 },
      { id: 4, status: 'DRAFT', isActive: false }, // Draft donor — excluded from every metric
    ];
    const grants = [
      { id: 1, donorId: 1, totalGrantAmount: 12000000, grantStatus: 'ACTIVE' },
      { id: 2, donorId: 1, totalGrantAmount: 8000000, grantStatus: 'APPROVED' },
      { id: 3, donorId: 3, totalGrantAmount: 5000000, grantStatus: 'CLOSED' },
      { id: 4, donorId: 4, totalGrantAmount: 3000000, grantStatus: 'DRAFT' }, // Draft grant on Draft donor
      { id: 5, donorId: 1, totalGrantAmount: 9000000, grantStatus: 'DRAFT' }, // Draft grant on active donor — still excluded
    ];
    const metrics = computeDashboardMetrics(donors, grants);
    expect(metrics.donorCount).toBe(3); // id4 draft excluded
    expect(metrics.activeDonorCount).toBe(2); // ids 1 & 3; id2 deactivated
    expect(metrics.draftDonorCount).toBe(0);
    expect(metrics.grantCount).toBe(3); // grants 4 & 5 (draft) excluded
    expect(metrics.openGrantCount).toBe(2);
    expect(metrics.activeGrantCount).toBe(1);
    expect(metrics.closedGrantCount).toBe(1);
    expect(metrics.blockedGrantCount).toBe(0);
    expect(metrics.draftBlockingAmount).toBe(0);
    expect(metrics.totalCommitted).toBe(25000000); // draft grants (3M + 9M) excluded
    expect(metrics.openCommitted).toBe(20000000);
  });
});

describe('fundingClassRows', () => {
  it('returns empty when the summary carries no breakdown', () => {
    expect(fundingClassRows(undefined)).toEqual([]);
    expect(fundingClassRows({})).toEqual([]);
    expect(fundingClassRows({ fundingByClass: [] })).toEqual([]);
  });

  it('normalises to FC → DC → CSR order, coercing amounts and filling absent buckets', () => {
    const summary = {
      fundingByClass: [
        { bucket: 'CSR', label: 'Corporate Social Responsibility', grantCount: 2, committed: '5000000', received: '3000000' },
        { bucket: 'FC', label: 'Foreign Contribution', grantCount: 1, committed: 16700000, received: 100000 },
        // DC bucket missing → filled with zeroes
      ],
    };
    const rows = fundingClassRows(summary);
    expect(rows.map((row) => row.bucket)).toEqual(['FC', 'DC', 'CSR']);

    const fc = rows.find((row) => row.bucket === 'FC');
    expect(fc.committed).toBe(16700000);
    expect(fc.grantCount).toBe(1);

    const csr = rows.find((row) => row.bucket === 'CSR');
    expect(csr.committed).toBe(5000000); // coerced from string
    expect(csr.received).toBe(3000000);

    const dc = rows.find((row) => row.bucket === 'DC');
    expect(dc).toMatchObject({ grantCount: 0, committed: 0, received: 0 });
    expect(dc.label).toBe('Domestic Contribution');
  });
});

describe('recentGrants', () => {
  it('sorts by start date descending and limits', () => {
    const grants = [
      { id: 1, startDate: '2025-01-01' },
      { id: 2, startDate: '2026-03-01' },
      { id: 3, startDate: '2025-06-01' },
    ];
    expect(recentGrants(grants, 2).map((grant) => grant.id)).toEqual([2, 3]);
  });
});
