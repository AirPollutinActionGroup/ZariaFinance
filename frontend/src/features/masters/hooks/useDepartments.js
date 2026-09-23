import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { queryKeys } from '../../../lib/query/queryKeys.js';
import { departmentService } from '../services/departmentService.js';

export function useDepartments(search) {
  return useQuery({
    queryKey: queryKeys.departments.list(search),
    queryFn: () => departmentService.listDepartments(search),
  });
}

export function useCreateDepartment() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (formValues) => departmentService.createDepartment(formValues),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: queryKeys.departments.all() }),
  });
}

/** activate | deactivate with shared invalidation. */
export function useDepartmentLifecycle() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, action }) =>
      action === 'activate'
        ? departmentService.activateDepartment(id)
        : departmentService.deactivateDepartment(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: queryKeys.departments.all() }),
  });
}
