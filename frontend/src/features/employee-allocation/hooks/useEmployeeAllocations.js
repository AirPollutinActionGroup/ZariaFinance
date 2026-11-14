import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { queryKeys } from '../../../lib/query/queryKeys.js';
import { employeeAllocationService } from '../services/employeeAllocationService.js';

export function useEmployeeAllocations() {
  return useQuery({
    queryKey: queryKeys.employeeAllocations.list(),
    queryFn: () => employeeAllocationService.listAllocations(),
  });
}

/** An employee's allocation history — added / ended / removed, newest first. */
export function useEmployeeAllocationHistory(employeeId) {
  return useQuery({
    queryKey: queryKeys.employeeAllocations.history(employeeId),
    queryFn: () => employeeAllocationService.getHistory(employeeId),
    enabled: employeeId != null && employeeId !== '',
  });
}

/** Every change refreshes both the list and the histories (they share the 'employeeAllocations' root). */
function useInvalidateAllocations() {
  const queryClient = useQueryClient();
  return () => queryClient.invalidateQueries({ queryKey: queryKeys.employeeAllocations.all() });
}

export function useCreateEmployeeAllocation() {
  const invalidate = useInvalidateAllocations();
  return useMutation({
    mutationFn: (formValues) => employeeAllocationService.createAllocation(formValues),
    onSuccess: invalidate,
  });
}

/** mutate({ id, endDate?, note? }) */
export function useEndEmployeeAllocation() {
  const invalidate = useInvalidateAllocations();
  return useMutation({
    mutationFn: ({ id, endDate, note }) => employeeAllocationService.endAllocation(id, { endDate, note }),
    onSuccess: invalidate,
  });
}

/** mutate({ id, note? }) */
export function useRemoveEmployeeAllocation() {
  const invalidate = useInvalidateAllocations();
  return useMutation({
    mutationFn: ({ id, note }) => employeeAllocationService.removeAllocation(id, note),
    onSuccess: invalidate,
  });
}
