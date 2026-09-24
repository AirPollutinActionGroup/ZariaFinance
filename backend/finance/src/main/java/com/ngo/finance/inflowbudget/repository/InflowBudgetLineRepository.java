package com.ngo.finance.inflowbudget.repository;

import com.ngo.finance.donor.entity.DonorTrancheCriterion;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

/**
 * Reads the donor tranche schedule as Inflow Budget lines. A tranche
 * criterion IS the expected receipt row; recording a receipt fills its
 * actual_* columns (see {@link com.ngo.finance.inflowbudget.service.InflowBudgetService}).
 */
@Repository
public interface InflowBudgetLineRepository extends JpaRepository<DonorTrancheCriterion, Long> {

    @Query("SELECT c FROM DonorTrancheCriterion c "
            + "JOIN FETCH c.donorDisbursementRule r "
            + "JOIN FETCH r.fundProfile p "
            + "JOIN FETCH p.donor d "
            + "LEFT JOIN FETCH p.programme "
            + "ORDER BY c.expectedReleaseDate ASC")
    List<DonorTrancheCriterion> findAllInflowLines();
}
