package com.ngo.finance.donation.repository;

import com.ngo.finance.donation.entity.Donation;
import com.ngo.finance.donation.enums.DonationType;
import com.ngo.finance.donation.enums.EightyGStatus;
import com.ngo.finance.donor.enums.FundMode;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

@Repository
public interface DonationRepository extends JpaRepository<Donation, Long> {

    Optional<Donation> findByDonationCode(String donationCode);

    List<Donation> findByDonorId(Long donorId);

    List<Donation> findByDonationType(DonationType donationType);

    List<Donation> findByFundMode(FundMode fundMode);

    List<Donation> findByEightyGStatus(EightyGStatus eightyGStatus);

    List<Donation> findByTenBdReportableFalse();

    long countByCreatedAtBetween(LocalDateTime start, LocalDateTime end);

    @Query("SELECT d FROM Donation d WHERE d.donationCode LIKE %:searchTerm% "
            + "OR d.donor.donorName LIKE %:searchTerm%")
    List<Donation> searchByCodeDonorOrReference(@Param("searchTerm") String searchTerm);
}
