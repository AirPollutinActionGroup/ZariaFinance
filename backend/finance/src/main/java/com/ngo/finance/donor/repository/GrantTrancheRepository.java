package com.ngo.finance.donor.repository;

import com.ngo.finance.donor.entity.GrantTranche;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

@Repository
public interface GrantTrancheRepository extends JpaRepository<GrantTranche, Long> {

    List<GrantTranche> findByGrantId(Long grantId);

    Optional<GrantTranche> findByGrantIdAndTrancheNumber(Long grantId, Integer trancheNumber);

    @Query("SELECT gt FROM GrantTranche gt WHERE gt.grant.id = :grantId ORDER BY gt.trancheNumber ASC")
    List<GrantTranche> findTranchesByGrantIdOrderedByNumber(@Param("grantId") Long grantId);

    @Query("SELECT gt FROM GrantTranche gt WHERE gt.grant.id = :grantId AND gt.trancheStatus = :status")
    List<GrantTranche> findByGrantIdAndStatus(@Param("grantId") Long grantId, @Param("status") String status);
}
