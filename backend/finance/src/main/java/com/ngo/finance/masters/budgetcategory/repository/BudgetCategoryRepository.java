package com.ngo.finance.masters.budgetcategory.repository;

import com.ngo.finance.masters.budgetcategory.entity.BudgetCategory;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

@Repository
public interface BudgetCategoryRepository extends JpaRepository<BudgetCategory, Long> {

    boolean existsByNameIgnoreCase(String name);

    boolean existsByNameIgnoreCaseAndIdNot(String name, Long id);

    List<BudgetCategory> findAllByOrderByIdAsc();

    @Query("SELECT c FROM BudgetCategory c "
            + "WHERE LOWER(c.name) LIKE LOWER(CONCAT('%', :searchTerm, '%')) "
            + "ORDER BY c.id ASC")
    List<BudgetCategory> search(@Param("searchTerm") String searchTerm);
}
