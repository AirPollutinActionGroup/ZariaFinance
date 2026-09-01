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

export function useUpdateEmployee(id) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (formValues) => employeeService.updateEmployee(id, formValues),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: queryKeys.employees.all() }),
  });
}

export function useUpdateEmployeeStatus(id) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (status) => employeeService.updateEmployeeStatus(id, status),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: queryKeys.employees.all() }),
  });
}
