import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useMemo } from 'react';
import { queryKeys } from '../../../lib/query/queryKeys.js';
import { budgetService } from '../services/budgetService.js';
import { useFinancialYears } from '../../financial-year/hooks/useFinancialYears.js';
import { toFinancialYearOptions } from '../lib/financialYear.js';

/**
 * Financial Year master (/api/v1/financial-years) as Budget options, plus the
 * label of the year running today (status ACTIVE) for defaults.
 */
export function useBudgetFinancialYears() {
  const query = useFinancialYears();
  const options = useMemo(() => toFinancialYearOptions(query.data || []), [query.data]);
  const activeLabel = options.find((fy) => fy.status === 'ACTIVE')?.label || null;
  return { ...query, options, activeLabel };
}

/** All budgets (list rows — no lines). Filtering happens on the page. */
export function useBudgets() {
  return useQuery({
    queryKey: queryKeys.budgets.list(),
    queryFn: () => budgetService.listBudgets(),
  });
}

export function useBudget(id) {
  return useQuery({
    queryKey: queryKeys.budgets.detail(id),
    queryFn: () => budgetService.getBudget(id),
    enabled: id != null && id !== '',
  });
}

export function useBudgetCategoryUsage() {
  return useQuery({
    queryKey: queryKeys.budgets.categoryUsage(),
    queryFn: () => budgetService.getCategoryUsage(),
  });
}

/** Any budget write changes lists, the budget itself and category usage — refresh them all. */
function useInvalidateBudgets() {
  const queryClient = useQueryClient();
  return () => queryClient.invalidateQueries({ queryKey: queryKeys.budgets.all() });
}

export function useSaveBudget() {
  const invalidate = useInvalidateBudgets();
  return useMutation({
    mutationFn: ({ id, draft, meta }) =>
      id != null ? budgetService.updateBudget(id, draft, meta) : budgetService.createBudget(draft, meta),
    onSuccess: invalidate,
  });
}

export function useBudgetTransition() {
  const invalidate = useInvalidateBudgets();
  return useMutation({
    mutationFn: ({ id, action, note, actor }) => budgetService.transitionBudget(id, action, { note, actor }),
    onSuccess: invalidate,
  });
}

export function useDeleteBudget() {
  const invalidate = useInvalidateBudgets();
  return useMutation({
    mutationFn: (id) => budgetService.deleteBudget(id),
    onSuccess: invalidate,
  });
}
