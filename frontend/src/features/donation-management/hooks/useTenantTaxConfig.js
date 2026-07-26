import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { queryKeys } from '../../../lib/query/queryKeys.js';
import { tenantTaxConfigApi } from '../api/tenantTaxConfigApi.js';

export function useTenantTaxConfig() {
  return useQuery({
    queryKey: queryKeys.tenantTaxConfig.all(),
    queryFn: () => tenantTaxConfigApi.get(),
  });
}

export function useUpdateTenantTaxConfig() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload) => tenantTaxConfigApi.update(payload),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: queryKeys.tenantTaxConfig.all() }),
  });
}
