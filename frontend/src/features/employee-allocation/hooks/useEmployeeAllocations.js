import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { queryKeys } from '../../../lib/query/queryKeys.js';
import { employeeAllocationService } from '../services/employeeAllocationService.js';

export function useEmployeeAllocations() {
  return useQuery({
    queryKey: queryKeys.employeeAllocations.all(),
    queryFn: () => employeeAllocationService.listAllocations(),
  });
}

export function useCreateEmployeeAllocation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (formValues) => employeeAllocationService.createAllocation(formValues),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: queryKeys.employeeAllocations.all() }),
  });
}

export function useRemoveEmployeeAllocation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id) => employeeAllocationService.removeAllocation(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: queryKeys.employeeAllocations.all() }),
  });
}
