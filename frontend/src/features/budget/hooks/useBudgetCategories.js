import { useSyncExternalStore } from 'react';
import { getBudgetCategories, subscribeBudgetCategories } from '../data/budgetCategoryRepository.js';

/** Live Budget Category master list — re-renders when Master Configuration changes it. */
export function useBudgetCategories() {
  return useSyncExternalStore(subscribeBudgetCategories, getBudgetCategories);
}
