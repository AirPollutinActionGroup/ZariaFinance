package com.ngo.finance.budget.service;

import com.ngo.finance.budget.dto.request.BudgetTransitionRequest;
import com.ngo.finance.budget.dto.request.SaveBudgetRequest;
import com.ngo.finance.budget.dto.response.BudgetResponse;
import com.ngo.finance.budget.enums.BudgetStatus;
import com.ngo.finance.budget.enums.BudgetType;
import java.util.List;
import java.util.Map;

/**
 * Service interface for Budget operations
 */
public interface BudgetService {

    /** All filters optional; {@code search} matches code, name, scope and state. */
    List<BudgetResponse> listBudgets(String financialYear, BudgetStatus status, BudgetType budgetType, String search);

    BudgetResponse getBudget(Long id);

    BudgetResponse createBudget(SaveBudgetRequest request);

    BudgetResponse updateBudget(Long id, SaveBudgetRequest request);

    BudgetResponse submitBudget(Long id, BudgetTransitionRequest request);

    BudgetResponse withdrawBudget(Long id, BudgetTransitionRequest request);

    BudgetResponse approveBudget(Long id, BudgetTransitionRequest request);

    BudgetResponse rejectBudget(Long id, BudgetTransitionRequest request);

    void deleteBudget(Long id);

    /** categoryId → number of budget lines using it. */
    Map<Long, Long> getCategoryUsage();
}
