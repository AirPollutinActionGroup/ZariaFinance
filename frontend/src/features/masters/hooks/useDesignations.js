import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { queryKeys } from '../../../lib/query/queryKeys.js';
import { designationService } from '../services/designationService.js';

export function useDesignations(search) {
  return useQuery({
    queryKey: queryKeys.designations.list(search),
    queryFn: () => designationService.listDesignations(search),
  });
}

export function useCreateDesignation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (formValues) => designationService.createDesignation(formValues),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: queryKeys.designations.all() }),
  });
}

/** activate | deactivate with shared invalidation. */
export function useDesignationLifecycle() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, action }) =>
      action === 'activate'
        ? designationService.activateDesignation(id)
        : designationService.deactivateDesignation(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: queryKeys.designations.all() }),
  });
}
