import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { queryKeys } from '../../../lib/query/queryKeys.js';
import { employeeService } from '../services/employeeService.js';

export function useEmployees(search) {
  return useQuery({
    queryKey: queryKeys.employees.list(search),
    queryFn: () => employeeService.listEmployees(search),
  });
}

export function useEmployee(id) {
  return useQuery({
    queryKey: queryKeys.employees.detail(id),
    queryFn: () => employeeService.getEmployee(id),
    enabled: id != null,
  });
}

export function useCreateEmployee() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (formValues) => employeeService.createEmployee(formValues),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: queryKeys.employees.all() }),
  });
}

/** activate | deactivate with shared invalidation. */
export function useEmployeeLifecycle(id) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (action) =>
      action === 'activate' ? employeeService.activateEmployee(id) : employeeService.deactivateEmployee(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: queryKeys.employees.all() }),
  });
}
