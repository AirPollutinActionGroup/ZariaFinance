import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { queryKeys } from '../../../lib/query/queryKeys.js';
import { paymentTypeGroupService } from '../services/paymentTypeGroupService.js';

export function usePaymentTypeGroups(search) {
  return useQuery({
    queryKey: queryKeys.paymentTypeGroups.list(search),
    queryFn: () => paymentTypeGroupService.listGroups(search),
  });
}

export function useCreatePaymentTypeGroup() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (formValues) => paymentTypeGroupService.createGroup(formValues),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: queryKeys.paymentTypeGroups.all() }),
  });
}

/** activate | deactivate with shared invalidation. */
export function usePaymentTypeGroupLifecycle() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, action }) =>
      action === 'activate'
        ? paymentTypeGroupService.activateGroup(id)
        : paymentTypeGroupService.deactivateGroup(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: queryKeys.paymentTypeGroups.all() }),
  });
}
