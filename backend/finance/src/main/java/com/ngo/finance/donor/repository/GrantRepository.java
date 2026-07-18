package com.ngo.finance.donor.repository;

import com.ngo.finance.donor.entity.GrantAgreement;
import com.ngo.finance.donor.enums.GrantStatus;
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

    List<GrantAgreement> findByProgrammeId(Long programmeId);

    List<GrantAgreement> findByGrantStatus(GrantStatus status);

    @Query("SELECT g FROM GrantAgreement g WHERE g.donor.id = :donorId AND g.grantStatus = :status")
    List<GrantAgreement> findByDonorIdAndStatus(@Param("donorId") Long donorId, @Param("status") GrantStatus status);

    @Query("SELECT g FROM GrantAgreement g WHERE g.grantCode LIKE %:searchTerm% OR g.agreementName LIKE %:searchTerm%")
    List<GrantAgreement> searchByCodeOrName(@Param("searchTerm") String searchTerm);

    /** Grant codes sharing a prefix (e.g. "ZRY/GA/2026/") — used to derive the next sequence. */
    @Query("SELECT g.grantCode FROM GrantAgreement g WHERE g.grantCode LIKE CONCAT(:prefix, '%')")
    List<String> findGrantCodesByPrefix(@Param("prefix") String prefix);
}
