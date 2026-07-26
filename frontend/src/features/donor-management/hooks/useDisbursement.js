import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { disbursementApi } from '../api/disbursementApi.js';
import { toDisbursementRequest } from '../mappers/disbursementMapper.js';

const disbursementKey = (grantId) => ['disbursement', 'byGrant', String(grantId)];

export function useDisbursement(grantId) {
  return useQuery({
    queryKey: disbursementKey(grantId),
    queryFn: () => disbursementApi.getByGrant(grantId),
    enabled: grantId != null,
  });
}

/**
 * All four mutations invalidate the tranche list and the dashboard as well as the
 * schedule: the tranche schedule panel and the funding chain both read the rows
 * this writes.
 */
function useDisbursementMutation(grantId, mutationFn) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn,
    onSuccess: (data) => {
      queryClient.setQueryData(disbursementKey(grantId), data);
      queryClient.invalidateQueries({ queryKey: ['tranches', 'byGrant', String(grantId)] });
      queryClient.invalidateQueries({ queryKey: ['dashboard', 'summary'] });
    },
  });
}

export function useSaveDisbursement(grantId) {
  return useDisbursementMutation(grantId, (formValues) =>
    disbursementApi.save(grantId, toDisbursementRequest(formValues)));
}

export function useFinaliseDisbursement(grantId) {
  return useDisbursementMutation(grantId, () => disbursementApi.finalise(grantId));
}

export function usePrefillDisbursement(grantId) {
  return useDisbursementMutation(grantId, () => disbursementApi.prefill(grantId));
}

export function useMarkCriterionMet(grantId) {
  return useDisbursementMutation(grantId, ({ criterionId, userId }) =>
    disbursementApi.markCriterionMet(criterionId, userId));
}
