import { describe, expect, it } from 'vitest';
import { computeDashboardMetrics, recentGrants } from './dashboardService.js';

describe('computeDashboardMetrics', () => {
  it('aggregates donors and grants without inventing numbers', () => {
    const donors = [{ id: 1, isActive: true }, { id: 2, isActive: false }, { id: 3 }];
    const grants = [
      { id: 1, totalGrantAmount: 12000000, grantStatus: 'ACTIVE' },
      { id: 2, totalGrantAmount: 8000000, grantStatus: 'APPROVED' },
      { id: 3, totalGrantAmount: 5000000, grantStatus: 'CLOSED' },
      { id: 4, totalGrantAmount: null, grantStatus: 'DRAFT' },
    ];
    const metrics = computeDashboardMetrics(donors, grants);
    expect(metrics.donorCount).toBe(3);
    expect(metrics.activeDonorCount).toBe(2);
    expect(metrics.grantCount).toBe(4);
    expect(metrics.openGrantCount).toBe(2);
    expect(metrics.totalCommitted).toBe(25000000);
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
