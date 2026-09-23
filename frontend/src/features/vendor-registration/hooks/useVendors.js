import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { queryKeys } from '../../../lib/query/queryKeys.js';
import { vendorService } from '../services/vendorService.js';

export function useVendors(search) {
  return useQuery({
    queryKey: queryKeys.vendors.list(search),
    queryFn: () => vendorService.listVendors(search),
  });
}

export function useVendor(id) {
  return useQuery({
    queryKey: queryKeys.vendors.detail(id),
    queryFn: () => vendorService.getVendor(id),
    enabled: id != null,
  });
}

export function useCreateVendor() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (formValues) => vendorService.createVendor(formValues),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: queryKeys.vendors.all() }),
  });
}

/** activate | deactivate with shared invalidation. */
export function useVendorLifecycle(id) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (action) =>
      action === 'activate' ? vendorService.activateVendor(id) : vendorService.deactivateVendor(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: queryKeys.vendors.all() }),
  });
}
