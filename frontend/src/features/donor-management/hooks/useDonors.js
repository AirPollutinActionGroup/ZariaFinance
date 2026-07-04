import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { queryKeys } from '../../../lib/query/queryKeys.js';
import { donorService } from '../services/donorService.js';

export function useDonors(search) {
  return useQuery({
    queryKey: queryKeys.donors.list(search),
    queryFn: () => donorService.listDonors(search),
  });
}

export function useDonor(id) {
  return useQuery({
    queryKey: queryKeys.donors.detail(id),
    queryFn: () => donorService.getDonor(id),
    enabled: id != null,
  });
}

export function useCreateDonor() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (formValues) => donorService.createDonor(formValues),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: queryKeys.donors.all() }),
  });
}

export function useUpdateDonor(id) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (formValues) => donorService.updateDonor(id, formValues),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: queryKeys.donors.all() }),
  });
}

/** activate | deactivate with shared invalidation. */
export function useDonorLifecycle(id) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (action) =>
      action === 'activate' ? donorService.activateDonor(id) : donorService.deactivateDonor(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: queryKeys.donors.all() }),
  });
}
