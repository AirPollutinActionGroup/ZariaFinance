import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { queryKeys } from '../../../lib/query/queryKeys.js';
import { roleService } from '../services/roleService.js';

export function useRoles(search) {
  return useQuery({
    queryKey: queryKeys.roles.list(search),
    queryFn: () => roleService.listRoles(search),
  });
}

export function useRole(id) {
  return useQuery({
    queryKey: queryKeys.roles.detail(id),
    queryFn: () => roleService.getRole(id),
    enabled: id != null,
  });
}

/** On-demand short-name availability check, triggered by the verify icon. */
export function useVerifyRoleShortName() {
  return useMutation({
    mutationFn: (shortName) => roleService.isShortNameAvailable(shortName),
  });
}

export function useCreateRole() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (formValues) => roleService.createRole(formValues),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: queryKeys.roles.all() }),
  });
}

/** activate | deactivate with shared invalidation. */
export function useRoleLifecycle() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, action }) =>
      action === 'activate' ? roleService.activateRole(id) : roleService.deactivateRole(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: queryKeys.roles.all() }),
  });
}

export function useAssignedUsers(roleId) {
  return useQuery({
    queryKey: queryKeys.roles.assignedUsers(roleId),
    queryFn: () => roleService.listAssignedUsers(roleId),
    enabled: roleId != null,
  });
}

/** Assigning/unassigning affects both the per-role user list and the list
 * page's assignedUserCount, so both are invalidated. */
export function useAssignUser(roleId) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (userId) => roleService.assignUser(roleId, userId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.roles.assignedUsers(roleId) });
      queryClient.invalidateQueries({ queryKey: queryKeys.roles.all() });
    },
  });
}

export function useUnassignUser(roleId) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (userId) => roleService.unassignUser(roleId, userId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.roles.assignedUsers(roleId) });
      queryClient.invalidateQueries({ queryKey: queryKeys.roles.all() });
    },
  });
}
