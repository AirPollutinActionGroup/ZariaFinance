package com.ngo.finance.donor.repository;

import com.ngo.finance.donor.entity.DonorContact;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

@Repository
public interface DonorContactRepository extends JpaRepository<DonorContact, Long> {

    List<DonorContact> findByDonorId(Long donorId);

    @Query("SELECT dc FROM DonorContact dc WHERE dc.donor.id = :donorId AND dc.isPrimary = true")
    java.util.Optional<DonorContact> findPrimaryContactByDonorId(@Param("donorId") Long donorId);

    @Query("SELECT dc FROM DonorContact dc WHERE dc.email = :email AND dc.donor.id = :donorId")
    java.util.Optional<DonorContact> findByEmailAndDonorId(@Param("email") String email, @Param("donorId") Long donorId);
}
