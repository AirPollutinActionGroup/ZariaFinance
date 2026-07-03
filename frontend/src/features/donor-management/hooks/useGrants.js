import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { queryKeys } from '../../../lib/query/queryKeys.js';
import { grantService } from '../services/grantService.js';

export function useGrants(filters) {
  return useQuery({
    queryKey: queryKeys.grants.list(filters),
    queryFn: () => grantService.listGrants(filters),
  });
}

export function useGrant(id) {
  return useQuery({
    queryKey: queryKeys.grants.detail(id),
    queryFn: () => grantService.getGrant(id),
    enabled: id != null,
  });
}

export function useCreateGrant() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (formValues) => grantService.createGrant(formValues),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: queryKeys.grants.all() }),
  });
}

/** approve | activate | close with shared invalidation. */
export function useGrantLifecycle(id) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (action) => {
      if (action === 'approve') return grantService.approveGrant(id);
      if (action === 'activate') return grantService.activateGrant(id);
      if (action === 'close') return grantService.closeGrant(id);
      throw new Error(`Unknown grant lifecycle action: ${action}`);
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: queryKeys.grants.all() }),
  });
}
