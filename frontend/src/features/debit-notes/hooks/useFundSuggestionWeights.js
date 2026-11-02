import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { queryKeys } from '../../../lib/query/queryKeys.js';
import { fundSuggestionApi } from '../api/fundSuggestionApi.js';

/** The saved fund suggestion weights, the shipped defaults, and who last changed them. */
export function useFundSuggestionWeights() {
  return useQuery({
    queryKey: queryKeys.debitNotes.fundSuggestionWeights(),
    queryFn: () => fundSuggestionApi.getWeights(),
  });
}

/** New weights re-rank every suggestion — refresh the weights and any open suggestions. */
function useInvalidateWeights() {
  const queryClient = useQueryClient();
  return () => queryClient.invalidateQueries({ queryKey: queryKeys.debitNotes.all() });
}

export function useUpdateFundSuggestionWeights() {
  const invalidate = useInvalidateWeights();
  return useMutation({
    mutationFn: (payload) => fundSuggestionApi.updateWeights(payload),
    onSuccess: invalidate,
  });
}

export function useResetFundSuggestionWeights() {
  const invalidate = useInvalidateWeights();
  return useMutation({
    mutationFn: (actor) => fundSuggestionApi.resetWeights(actor),
    onSuccess: invalidate,
  });
}
