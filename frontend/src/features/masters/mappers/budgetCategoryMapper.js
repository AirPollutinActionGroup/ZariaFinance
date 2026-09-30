import { MASTER_STATUS_LABEL } from '../constants.js';

/**
 * BudgetCategoryMapper — translates between backend DTOs
 * (BudgetCategoryResponse, Create/UpdateBudgetCategoryRequest) and frontend
 * view/form models. Backend field names are preserved verbatim.
 *
 * `id` is the numeric record id — used for API calls and stored on budget
 * lines (so renaming a category never breaks them).
 */

/** BudgetCategoryResponse → view model. */
export function fromBudgetCategoryResponse(dto) {
  return {
    ...dto,
    description: dto.description || '',
    statusLabel: MASTER_STATUS_LABEL[dto.status] || dto.status || '—',
  };
}

/** Form values → CreateBudgetCategoryRequest. */
export function toCreateBudgetCategoryRequest(values) {
  return {
    name: values.name.trim(),
    description: values.description?.trim() || undefined,
    status: values.status === 'ACTIVE',
  };
}

/** Form values → UpdateBudgetCategoryRequest. */
export function toUpdateBudgetCategoryRequest(values) {
  return {
    name: values.name.trim(),
    description: values.description?.trim() ?? '',
  };
}
