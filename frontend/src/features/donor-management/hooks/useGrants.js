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

export function useUpdateGrant(id) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (formValues) => grantService.updateGrant(id, formValues),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: queryKeys.grants.all() }),
  });
}

/**
 * approve | activate | close | hold | resume | complete, with shared
 * invalidation. `payload` is only used by approve (remarks/approvedBy) and
 * hold (remarks).
 */
export function useGrantLifecycle(id) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ action, payload } = {}) => {
      if (action === 'approve') return grantService.approveGrant(id, payload);
      if (action === 'activate') return grantService.activateGrant(id);
      if (action === 'close') return grantService.closeGrant(id);
      if (action === 'hold') return grantService.holdGrant(id, payload);
      if (action === 'resume') return grantService.resumeGrant(id);
      if (action === 'complete') return grantService.completeGrant(id);
      throw new Error(`Unknown grant lifecycle action: ${action}`);
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: queryKeys.grants.all() }),
  });
}
