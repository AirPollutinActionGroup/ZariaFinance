import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { queryKeys } from '../../../lib/query/queryKeys.js';
import { donorTypeService } from '../services/donorTypeService.js';

export function useDonorTypes(search) {
  return useQuery({
    queryKey: queryKeys.donorTypes.list(search),
    queryFn: () => donorTypeService.listDonorTypes(search),
  });
}

export function useCreateDonorType() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (formValues) => donorTypeService.createDonorType(formValues),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: queryKeys.donorTypes.all() }),
  });
}

/** activate | deactivate with shared invalidation. */
export function useDonorTypeLifecycle() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, action }) =>
      action === 'activate'
        ? donorTypeService.activateDonorType(id)
        : donorTypeService.deactivateDonorType(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: queryKeys.donorTypes.all() }),
  });
}
