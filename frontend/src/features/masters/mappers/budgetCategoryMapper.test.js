import { describe, expect, it } from 'vitest';
import {
  fromBudgetCategoryResponse,
  toCreateBudgetCategoryRequest,
  toUpdateBudgetCategoryRequest,
} from './budgetCategoryMapper.js';

describe('budgetCategoryMapper', () => {
  it('maps a response to the view model with a status label', () => {
    expect(fromBudgetCategoryResponse({ id: 3, name: 'Travel', status: 'INACTIVE' })).toEqual({
      id: 3,
      name: 'Travel',
      description: '',
      status: 'INACTIVE',
      statusLabel: 'Inactive',
    });
  });

  it('builds create and update requests from form values', () => {
    expect(toCreateBudgetCategoryRequest({ name: ' Training ', description: '  ', status: 'ACTIVE' })).toEqual({
      name: 'Training',
      description: undefined,
      status: true,
    });
    expect(toCreateBudgetCategoryRequest({ name: 'X', description: 'y', status: 'INACTIVE' }).status).toBe(false);
    // An emptied description is sent as '' so the server clears it (null would leave it unchanged).
    expect(toUpdateBudgetCategoryRequest({ name: ' Travel ', description: ' ' })).toEqual({ name: 'Travel', description: '' });
  });
});
