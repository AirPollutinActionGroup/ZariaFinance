package com.ngo.finance.budget.repository;

import com.ngo.finance.budget.entity.BudgetLine;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

@Repository
public interface BudgetLineRepository extends JpaRepository<BudgetLine, Long> {

    /** [categoryId, number of budget lines using it] — for the Budget Category master's "Used in" column. */
    @Query("SELECT l.category.id, COUNT(l) FROM BudgetLine l GROUP BY l.category.id")
    List<Object[]> countLinesByCategory();
}
