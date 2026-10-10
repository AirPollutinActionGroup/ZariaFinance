package com.ngo.finance.outflow.repository;

import com.ngo.finance.outflow.entity.DebitNote;
import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

@Repository
public interface DebitNoteRepository extends JpaRepository<DebitNote, Long> {

    @EntityGraph(attributePaths = {"budgetLine", "budgetLine.budget"})
    List<DebitNote> findAllByOrderByNoteDateDescIdDesc();

    @EntityGraph(attributePaths = {"budgetLine", "budgetLine.budget"})
    Optional<DebitNote> findByNoteCode(String noteCode);

    Optional<DebitNote> findTopByNoteCodeStartingWithOrderByNoteCodeDesc(String prefix);

    /** [budgetLineId, quarter, sum] of notes, per outflow row. */
    @Query("SELECT d.budgetLine.id, d.quarter, SUM(d.amount) FROM DebitNote d "
            + "GROUP BY d.budgetLine.id, d.quarter")
    List<Object[]> sumByRow();

    @Query("SELECT COALESCE(SUM(d.amount), 0) FROM DebitNote d "
            + "WHERE d.budgetLine.id = :lineId AND d.quarter = :quarter")
    BigDecimal sumOnRow(@Param("lineId") Long lineId, @Param("quarter") Short quarter);

    /** Debit notes already charged to a fund profile. */
    @Query("SELECT COALESCE(SUM(d.amount), 0) FROM DebitNote d WHERE d.fundProfileRef = :fundProfileRef")
    BigDecimal sumOnFundProfile(@Param("fundProfileRef") String fundProfileRef);

    /** [fundProfileRef, sum] of debit notes, per fund profile charged. */
    @Query("SELECT d.fundProfileRef, SUM(d.amount) FROM DebitNote d "
            + "WHERE d.fundProfileRef IS NOT NULL GROUP BY d.fundProfileRef")
    List<Object[]> sumByFundProfile();
}
