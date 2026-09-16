import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { queryKeys } from '../../../lib/query/queryKeys.js';
import { paymentTypeLedgerService } from '../services/paymentTypeLedgerService.js';

export function usePaymentTypeLedgers(search) {
  return useQuery({
    queryKey: queryKeys.paymentTypeLedgers.list(search),
    queryFn: () => paymentTypeLedgerService.listLedgers(search),
  });
}

export function useCreatePaymentTypeLedger() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (formValues) => paymentTypeLedgerService.createLedger(formValues),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: queryKeys.paymentTypeLedgers.all() }),
  });
}

/** activate | deactivate with shared invalidation. */
export function usePaymentTypeLedgerLifecycle() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, action }) =>
      action === 'activate'
        ? paymentTypeLedgerService.activateLedger(id)
        : paymentTypeLedgerService.deactivateLedger(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: queryKeys.paymentTypeLedgers.all() }),
  });
}
