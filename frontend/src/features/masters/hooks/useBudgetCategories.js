import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { queryKeys } from '../../../lib/query/queryKeys.js';
import { budgetCategoryService } from '../services/budgetCategoryService.js';

export function useBudgetCategories(search) {
  return useQuery({
    queryKey: queryKeys.budgetCategories.list(search),
    queryFn: () => budgetCategoryService.listBudgetCategories(search),
  });
}

export function useCreateBudgetCategory() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (formValues) => budgetCategoryService.createBudgetCategory(formValues),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: queryKeys.budgetCategories.all() }),
  });
}

export function useUpdateBudgetCategory() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, values }) => budgetCategoryService.updateBudgetCategory(id, values),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: queryKeys.budgetCategories.all() }),
  });
}

/** activate | deactivate with shared invalidation. */
export function useBudgetCategoryLifecycle() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, action }) =>
      action === 'activate'
        ? budgetCategoryService.activateBudgetCategory(id)
        : budgetCategoryService.deactivateBudgetCategory(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: queryKeys.budgetCategories.all() }),
  });
}
