import { describe, expect, it } from 'vitest';
import { computeDashboardMetrics, recentGrants } from './dashboardService.js';
import { MOCK_DONORS, MOCK_GRANTS } from './mockWorkbook.js';
import { computeFundingTotals } from './mockFunding.js';

describe('computeDashboardMetrics', () => {
  it('aggregates donors and grants without inventing numbers', () => {
    const donors = [
      { id: 1, isActive: true },
      { id: 2, isActive: false },
      { id: 3 },
      { id: 4, status: 'DRAFT', isActive: false },
    ];
    const grants = [
      { id: 1, donorId: 1, totalGrantAmount: 12000000, grantStatus: 'ACTIVE' },
      { id: 2, donorId: 1, totalGrantAmount: 8000000, grantStatus: 'APPROVED' },
      { id: 3, donorId: 3, totalGrantAmount: 5000000, grantStatus: 'CLOSED' },
      { id: 4, donorId: 4, totalGrantAmount: 3000000, grantStatus: 'DRAFT' },
    ];
    const metrics = computeDashboardMetrics(donors, grants);
    expect(metrics.donorCount).toBe(4);
    expect(metrics.activeDonorCount).toBe(2); // ids 1 & 3; id2 deactivated, id4 draft
    expect(metrics.draftDonorCount).toBe(1);
    expect(metrics.grantCount).toBe(4);
    expect(metrics.openGrantCount).toBe(2);
    expect(metrics.activeGrantCount).toBe(1);
    expect(metrics.closedGrantCount).toBe(1);
    expect(metrics.blockedGrantCount).toBe(1); // grant 4 hangs off draft donor 4
    expect(metrics.draftBlockingAmount).toBe(3000000);
    expect(metrics.totalCommitted).toBe(28000000);
    expect(metrics.openCommitted).toBe(20000000);
  });
});

describe('MOCK_WORKBOOK parity with the design preview', () => {
  it('donor & grant breakdowns match the reference dashboard', () => {
    const m = computeDashboardMetrics(MOCK_DONORS, MOCK_GRANTS);
    expect(m.donorCount).toBe(14);
    expect(m.activeDonorCount).toBe(13);
    expect(m.draftDonorCount).toBe(1);
    expect(m.draftBlockingAmount).toBe(10000000); // ₹1.00 Cr
    expect(m.grantCount).toBe(14);
    expect(m.activeGrantCount).toBe(12);
    expect(m.closedGrantCount).toBe(1);
    expect(m.blockedGrantCount).toBe(1);
  });

  it('funding-chain totals match the reference (₹10.68 / 7.54 / 4.91 / 2.63 Cr)', () => {
    const f = computeFundingTotals(MOCK_GRANTS);
    expect(f.committed).toBe(106800000);
    expect(f.received).toBe(75400000);
    expect(f.utilised).toBe(49100000);
    expect(f.available).toBe(26300000);
    expect(f.open).toBe(31400000);
    expect(f.blocked).toBe(10000000);
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
