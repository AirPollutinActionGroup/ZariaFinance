package com.ngo.finance.masters.budgetcategory.service;

import com.ngo.finance.masters.budgetcategory.dto.request.CreateBudgetCategoryRequest;
import com.ngo.finance.masters.budgetcategory.dto.request.UpdateBudgetCategoryRequest;
import com.ngo.finance.masters.budgetcategory.dto.response.BudgetCategoryResponse;
import java.util.List;

/**
 * Service interface for Budget Category operations
 */
public interface BudgetCategoryService {

    BudgetCategoryResponse createBudgetCategory(CreateBudgetCategoryRequest request);

    BudgetCategoryResponse getBudgetCategoryById(Long id);

    List<BudgetCategoryResponse> getAllBudgetCategories();

    List<BudgetCategoryResponse> searchBudgetCategories(String searchTerm);

    BudgetCategoryResponse updateBudgetCategory(Long id, UpdateBudgetCategoryRequest request);

    void activateBudgetCategory(Long id);

    void deactivateBudgetCategory(Long id);
}
