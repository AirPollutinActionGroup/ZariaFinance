package com.ngo.finance.donor.repository;

import com.ngo.finance.donor.entity.DonorFundProfile;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

@Repository
public interface DonorFundProfileRepository extends JpaRepository<DonorFundProfile, Long> {

    @Query("SELECT p FROM DonorFundProfile p WHERE p.donor.id = :donorId ORDER BY p.createdAt DESC")
    List<DonorFundProfile> findByDonorId(@Param("donorId") Long donorId);
}
