import { describe, expect, it } from 'vitest';
import { computeDashboardMetrics, recentGrants } from './dashboardService.js';

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
