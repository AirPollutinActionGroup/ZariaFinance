package com.ngo.finance.donor.repository;

import com.ngo.finance.donor.entity.DonorMaster;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

@Repository
public interface DonorRepository extends JpaRepository<DonorMaster, Long> {

    Optional<DonorMaster> findByDonorCode(String donorCode);

    Optional<DonorMaster> findByEmail(String email);

    @Query("SELECT d FROM DonorMaster d WHERE d.isActive = true ORDER BY d.createdAt DESC")
    java.util.List<DonorMaster> findAllActive();

    @Query("SELECT d FROM DonorMaster d WHERE d.donorCode LIKE %:searchTerm% OR d.donorName LIKE %:searchTerm%")
    java.util.List<DonorMaster> searchByCodeOrName(@Param("searchTerm") String searchTerm);
}
