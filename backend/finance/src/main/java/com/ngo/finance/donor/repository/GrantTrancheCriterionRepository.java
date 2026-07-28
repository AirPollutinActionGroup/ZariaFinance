package com.ngo.finance.donor.repository;

import com.ngo.finance.donor.entity.GrantTrancheCriterion;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

@Repository
public interface GrantTrancheCriterionRepository extends JpaRepository<GrantTrancheCriterion, Long> {

    /**
     * Unmet criteria that have a reminder configured — the candidate set for the
     * nightly sweep. Joins are fetched because the sweep needs the tranche's
     * expected release date and the grant it belongs to.
     */
    @Query("SELECT c FROM GrantTrancheCriterion c "
            + "JOIN FETCH c.reminder r "
            + "JOIN FETCH c.tranche t "
            + "JOIN FETCH t.grant g "
            + "WHERE c.met = false AND t.plannedReleaseDate IS NOT NULL")
    List<GrantTrancheCriterion> findUnmetWithReminders();
}
