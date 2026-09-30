package com.ngo.finance.budget.repository;

import com.ngo.finance.budget.entity.Budget;
import com.ngo.finance.budget.enums.BudgetStatus;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface BudgetRepository extends JpaRepository<Budget, Long> {

    /** List view: lines are needed for totals, programme/state for the scope columns. */
    @EntityGraph(attributePaths = {"lines", "programme", "state", "financialYearRef"})
    List<Budget> findAllByOrderByUpdatedAtDesc();

    @EntityGraph(attributePaths = {"lines", "lines.category", "programme", "state", "financialYearRef"})
    Optional<Budget> findWithLinesById(Long id);

    /** Approved budgets feed the outflow schedule. */
    @EntityGraph(attributePaths = {"lines", "lines.category", "programme", "state", "financialYearRef"})
    List<Budget> findAllByStatusOrderByBudgetCodeAsc(BudgetStatus status);

    @EntityGraph(attributePaths = {"lines", "lines.category", "programme", "state", "financialYearRef"})
    Optional<Budget> findWithLinesByBudgetCode(String budgetCode);

    /** Highest code for a year prefix, e.g. "BUD-2026-" → BUD-2026-007. */
    Optional<Budget> findTopByBudgetCodeStartingWithOrderByBudgetCodeDesc(String prefix);
}
