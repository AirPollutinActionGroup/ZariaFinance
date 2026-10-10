package com.ngo.finance.donor.repository;

import com.ngo.finance.donor.entity.GrantAgreement;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

@Repository
public interface GrantRepository extends JpaRepository<GrantAgreement, Long> {

    Optional<GrantAgreement> findByGrantCode(String grantCode);

    List<GrantAgreement> findByDonorId(Long donorId);

    // A fund profile is meant to back at most one grant, but pre-existing data
    // may still have more than one attached (predates that constraint) — a List
    // rather than Optional avoids IncorrectResultSizeDataAccessException on those.
    List<GrantAgreement> findByFundProfileId(Long fundProfileId);

    @Query("SELECT g FROM GrantAgreement g WHERE g.grantCode LIKE %:searchTerm% OR g.agreementName LIKE %:searchTerm%")
    List<GrantAgreement> searchByCodeOrName(@Param("searchTerm") String searchTerm);

    /** Grant codes sharing a prefix (e.g. "ZRY/GA/2026/") — used to derive the next sequence. */
    @Query("SELECT g.grantCode FROM GrantAgreement g WHERE g.grantCode LIKE CONCAT(:prefix, '%')")
    List<String> findGrantCodesByPrefix(@Param("prefix") String prefix);
}
