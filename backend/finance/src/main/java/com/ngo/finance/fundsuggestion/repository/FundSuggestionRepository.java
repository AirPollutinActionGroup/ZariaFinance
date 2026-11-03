package com.ngo.finance.fundsuggestion.repository;

import com.ngo.finance.donor.entity.DonorFundProfile;
import com.ngo.finance.donor.entity.GrantAgreement;
import java.util.List;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.Repository;
import org.springframework.data.repository.query.Param;

/**
 * Read-only queries behind fund suggestions: the candidate funds, their grants,
 * and what has gone in and out of each fund — every fund in a handful of
 * queries rather than a pair per fund.
 */
@org.springframework.stereotype.Repository
public interface FundSuggestionRepository extends Repository<DonorFundProfile, Long> {

    /** Fund profiles of active donors, with what the eligibility rules read. */
    @Query("SELECT DISTINCT p FROM DonorFundProfile p JOIN FETCH p.donor d "
            + "LEFT JOIN FETCH p.programme LEFT JOIN FETCH p.geographies g LEFT JOIN FETCH g.state "
            + "WHERE d.isActive = true")
    List<DonorFundProfile> findCandidateProfiles();

    @Query("SELECT g FROM GrantAgreement g WHERE g.fundProfile IS NOT NULL")
    List<GrantAgreement> findGrantsWithFundProfile();

    /** [fundProfileRef, sum] — money received into each fund (credit notes). */
    @Query("SELECT c.fundProfileRef, SUM(c.amount) FROM CreditNote c "
            + "WHERE c.fundProfileRef IS NOT NULL GROUP BY c.fundProfileRef")
    List<Object[]> sumCreditsByFundProfile();

    /** [fundProfileRef, sum] — money already charged to each fund (debit notes). */
    @Query("SELECT d.fundProfileRef, SUM(d.amount) FROM DebitNote d "
            + "WHERE d.fundProfileRef IS NOT NULL GROUP BY d.fundProfileRef")
    List<Object[]> sumDebitsByFundProfile();

    /** [fundProfileRef, count] — debit notes on one budget line, per fund. */
    @Query("SELECT d.fundProfileRef, COUNT(d) FROM DebitNote d "
            + "WHERE d.budgetLine.id = :lineId AND d.fundProfileRef IS NOT NULL GROUP BY d.fundProfileRef")
    List<Object[]> countDebitsOnLineByFundProfile(@Param("lineId") Long lineId);
}
