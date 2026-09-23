import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { queryKeys } from '../../../lib/query/queryKeys.js';
import { userRequestsService } from '../services/userRequestsService.js';

export function useUserRequests() {
  return useQuery({
    queryKey: queryKeys.userRequests.all(),
    queryFn: () => userRequestsService.listRequests(),
  });
}

export function useUserRequest(id) {
  return useQuery({
    queryKey: queryKeys.userRequests.detail(id),
    queryFn: () => userRequestsService.getRequest(id),
    enabled: id != null,
  });
}

/** approve | reject with shared invalidation of the list + this detail. */
export function useUserRequestDecision(id) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (decision) =>
      decision === 'approve'
        ? userRequestsService.approveRequest(id)
        : userRequestsService.rejectRequest(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.userRequests.all() });
      queryClient.invalidateQueries({ queryKey: queryKeys.userRequests.detail(id) });
    },
  });
}
