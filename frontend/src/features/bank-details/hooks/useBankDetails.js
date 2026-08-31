import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { queryKeys } from '../../../lib/query/queryKeys.js';
import { bankDetailService } from '../services/bankDetailService.js';

export function useBankDetails(search) {
  return useQuery({
    queryKey: queryKeys.bankDetails.list(search),
    queryFn: () => bankDetailService.listBankDetails(search),
  });
}

export function useCreateBankDetail() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (formValues) => bankDetailService.createBankDetail(formValues),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: queryKeys.bankDetails.all() }),
  });
}

/** activate | deactivate with shared invalidation. */
export function useBankDetailLifecycle() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, action }) =>
      action === 'activate'
        ? bankDetailService.activateBankDetail(id)
        : bankDetailService.deactivateBankDetail(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: queryKeys.bankDetails.all() }),
  });
}
