import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { queryKeys } from '../../../lib/query/queryKeys.js';
import { paymentModeService } from '../services/paymentModeService.js';

export function usePaymentModes(search) {
  return useQuery({
    queryKey: queryKeys.paymentModes.list(search),
    queryFn: () => paymentModeService.listPaymentModes(search),
  });
}

export function useCreatePaymentMode() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (formValues) => paymentModeService.createPaymentMode(formValues),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: queryKeys.paymentModes.all() }),
  });
}

/** activate | deactivate with shared invalidation. */
export function usePaymentModeLifecycle() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, action }) =>
      action === 'activate'
        ? paymentModeService.activatePaymentMode(id)
        : paymentModeService.deactivatePaymentMode(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: queryKeys.paymentModes.all() }),
  });
}
