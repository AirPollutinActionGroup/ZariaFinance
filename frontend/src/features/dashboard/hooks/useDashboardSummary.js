import { useQuery } from '@tanstack/react-query';
import { http } from '../../../lib/api/apiClient.js';

/**
 * Live donor-module position computed server-side (GET /api/v1/dashboard/summary):
 * donor / grant counts + the funding chain (received is real, from tranche
 * receipts; utilised is the seeded placeholder).
 */
export function useDashboardSummary() {
  return useQuery({
    queryKey: ['dashboard', 'summary'],
    queryFn: () => http.get('/v1/dashboard/summary'),
  });
}
