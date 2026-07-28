import { useQuery } from '@tanstack/react-query';
import { queryKeys } from '../../../lib/query/queryKeys.js';
import { userRegisterApi } from '../../registration/api/userRegisterApi.js';

/**
 * All registered users, for the grant form's "Approved by" picker. The user list
 * changes rarely, so it is cached for the session.
 */
export function useUsers() {
  return useQuery({
    queryKey: queryKeys.users.all(),
    queryFn: () => userRegisterApi.list(),
    staleTime: 5 * 60 * 1000,
  });
}

/** UserRegisterDto → display name, falling back to the username. */
export function userDisplayName(user) {
  const full = [user.firstName, user.lastName].filter(Boolean).join(' ').trim();
  return full || user.username || `User ${user.id}`;
}
