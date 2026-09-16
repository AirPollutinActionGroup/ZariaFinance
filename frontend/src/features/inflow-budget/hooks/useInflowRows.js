import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { queryKeys } from '../../../lib/query/queryKeys.js';
import { inflowService } from '../services/inflowService.js';

export function useInflowRows() {
  return useQuery({
    queryKey: queryKeys.inflowTranches.all(),
    queryFn: () => inflowService.listInflowRows(),
  });
}

export function useInflowRow(id) {
  return useQuery({
    queryKey: queryKeys.inflowTranches.detail(id),
    queryFn: () => inflowService.getInflowRow(id),
    enabled: id != null,
  });
}

export function useRecordInflowReceipt() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, form }) => inflowService.recordReceipt(id, form),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.inflowTranches.all() });
      // The dashboard funding chain depends on tranche receipts.
      queryClient.invalidateQueries({ queryKey: ['dashboard', 'summary'] });
    },
  });
}
