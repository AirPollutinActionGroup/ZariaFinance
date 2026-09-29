import { beforeEach, describe, expect, it, vi } from 'vitest';
import {
  createBudgetCategory,
  getBudgetCategories,
  getBudgetCategoryName,
  resetBudgetCategoriesForTests,
  setBudgetCategoryStatus,
  subscribeBudgetCategories,
  updateBudgetCategory,
} from './budgetCategoryRepository.js';

describe('budgetCategoryRepository', () => {
  beforeEach(() => resetBudgetCategoriesForTests());

  it('seeds the original six categories, all active', () => {
    expect(getBudgetCategories().map((c) => c.id)).toEqual(['PERSONNEL', 'PROGRAMME', 'CONSULTANTS', 'TRAVEL', 'EQUIPMENT', 'ADMIN']);
    expect(getBudgetCategories().every((c) => c.status === 'ACTIVE')).toBe(true);
    expect(getBudgetCategoryName('ADMIN')).toBe('Admin & overheads');
    expect(getBudgetCategoryName('GONE')).toBe('GONE');
  });

  it('creates a category with a unique code and tidied name, and notifies subscribers', () => {
    const listener = vi.fn();
    const unsubscribe = subscribeBudgetCategories(listener);
    const created = createBudgetCategory({ name: '  Office   rent & utilities ' });
    expect(created).toMatchObject({ id: 'OFFICE_RENT_UTILITIES', name: 'Office rent & utilities', status: 'ACTIVE' });
    expect(createBudgetCategory({ name: 'Office rent / utilities' }).id).toBe('OFFICE_RENT_UTILITIES_2');
    expect(listener).toHaveBeenCalledTimes(2);
    unsubscribe();
  });

  it('refuses blank and duplicate names (case-insensitive), including on rename', () => {
    expect(() => createBudgetCategory({ name: '  ' })).toThrow(/required/);
    expect(() => createBudgetCategory({ name: 'travel' })).toThrow(/already exists/);
    expect(() => updateBudgetCategory('ADMIN', { name: 'TRAVEL' })).toThrow(/already exists/);
  });

  it('renames without changing the code, and toggles status', () => {
    updateBudgetCategory('TRAVEL', { name: 'Travel & lodging', description: 'x' });
    expect(getBudgetCategoryName('TRAVEL')).toBe('Travel & lodging');
    setBudgetCategoryStatus('TRAVEL', 'INACTIVE');
    expect(getBudgetCategories().find((c) => c.id === 'TRAVEL').status).toBe('INACTIVE');
  });
});
