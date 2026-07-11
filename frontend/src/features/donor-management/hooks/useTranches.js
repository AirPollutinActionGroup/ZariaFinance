import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { trancheApi } from '../api/trancheApi.js';

const trancheKey = (grantId) => ['tranches', 'byGrant', String(grantId)];

export function useTranchesByGrant(grantId) {
  return useQuery({
    queryKey: trancheKey(grantId),
    queryFn: () => trancheApi.listByGrant(grantId),
    enabled: grantId != null,
  });
}

export function useReceiveTranche(grantId) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ trancheId, payload }) => trancheApi.receive(trancheId, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: trancheKey(grantId) });
      // The dashboard funding chain depends on tranche receipts.
      queryClient.invalidateQueries({ queryKey: ['dashboard', 'summary'] });
    },
  });
}
