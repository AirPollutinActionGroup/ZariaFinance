import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { queryKeys } from '../../../lib/query/queryKeys.js';
import { financialYearService } from '../services/financialYearService.js';

export function useFinancialYears() {
  return useQuery({
    queryKey: queryKeys.financialYears.all(),
    queryFn: () => financialYearService.listFinancialYears(),
  });
}

export function useCreateFinancialYear() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (formValues) => financialYearService.createFinancialYear(formValues),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: queryKeys.financialYears.all() }),
  });
}

export function useSetCurrentFinancialYear() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id) => financialYearService.setCurrentFinancialYear(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: queryKeys.financialYears.all() }),
  });
}
