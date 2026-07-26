import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { roleDirectoryApi } from '../api/roleDirectoryApi.js';

const directoryKey = () => ['roleDirectory'];

export function useRoleDirectory() {
  return useQuery({
    queryKey: directoryKey(),
    queryFn: () => roleDirectoryApi.list(),
  });
}

export function useSaveRoleDirectory() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (entries) => roleDirectoryApi.save(entries),
    onSuccess: (data) => {
      queryClient.setQueryData(directoryKey(), data);
      // Reminder cards show the resolved holder, so they are now stale.
      queryClient.invalidateQueries({ queryKey: ['disbursement'] });
    },
  });
}
