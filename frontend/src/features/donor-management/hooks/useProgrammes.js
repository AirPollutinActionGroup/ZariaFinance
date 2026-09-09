import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { queryKeys } from '../../../lib/query/queryKeys.js';
import { programmeService } from '../services/programmeService.js';

export function useProgrammes() {
  return useQuery({
    queryKey: queryKeys.programmes.all(),
    queryFn: () => programmeService.listProgrammes(),
  });
}

export function useProgramme(id) {
  return useQuery({
    queryKey: queryKeys.programmes.detail(id),
    queryFn: () => programmeService.getProgramme(id),
    enabled: id != null,
  });
}

export function useCreateProgramme() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (formValues) => programmeService.createProgramme(formValues),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: queryKeys.programmes.all() }),
  });
}

/** activate | deactivate with shared invalidation. */
export function useProgrammeLifecycle(id) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (action) =>
      action === 'activate' ? programmeService.activateProgramme(id) : programmeService.deactivateProgramme(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: queryKeys.programmes.all() }),
  });
}

/** Sets any lifecycle status directly (Planned/Active/On Hold/Complete/Close). */
export function useUpdateProgrammeStatus(id) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (status) => programmeService.updateProgrammeStatus(id, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.programmes.all() });
      queryClient.invalidateQueries({ queryKey: queryKeys.programmes.detail(id) });
    },
  });
}
