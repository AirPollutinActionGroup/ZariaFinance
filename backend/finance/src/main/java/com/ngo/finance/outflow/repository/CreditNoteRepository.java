package com.ngo.finance.outflow.repository;

import com.ngo.finance.outflow.entity.CreditNote;
import java.math.BigDecimal;
import java.util.Collection;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

@Repository
public interface CreditNoteRepository extends JpaRepository<CreditNote, Long> {

    List<CreditNote> findAllByOrderByNoteDateDescIdDesc();

    Optional<CreditNote> findByNoteCode(String noteCode);

    Optional<CreditNote> findTopByNoteCodeStartingWithOrderByNoteCodeDesc(String prefix);

    /** Credit notes received against these tranches (Inflow Budget lines), by tranche criterion id. */
    List<CreditNote> findByTrancheRefIn(Collection<String> trancheRefs);

    /** Lump-sum credit notes on these fund profiles — they carry no tranche. */
    List<CreditNote> findByDisbursementTypeAndTrancheRefIsNullAndFundProfileRefIn(String disbursementType, Collection<String> fundProfileRefs);

    /** Money received into a fund profile — every credit note on it. */
    @Query("SELECT COALESCE(SUM(c.amount), 0) FROM CreditNote c WHERE c.fundProfileRef = :fundProfileRef")
    BigDecimal sumOnFundProfile(@Param("fundProfileRef") String fundProfileRef);

    /** [fundProfileRef, sum] of credit notes, per fund profile received into. */
    @Query("SELECT c.fundProfileRef, SUM(c.amount) FROM CreditNote c "
            + "WHERE c.fundProfileRef IS NOT NULL GROUP BY c.fundProfileRef")
    List<Object[]> sumByFundProfile();

}
