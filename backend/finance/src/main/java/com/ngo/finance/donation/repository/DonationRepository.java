package com.ngo.finance.donation.repository;

import com.ngo.finance.donation.entity.Donation;
import com.ngo.finance.donation.enums.Book;
import com.ngo.finance.donation.enums.DonationType;
import com.ngo.finance.donation.enums.DonorIdentification;
import com.ngo.finance.donation.enums.EightyGStatus;
import com.ngo.finance.donation.enums.FundMode;
import java.math.BigDecimal;
import java.time.LocalDate;
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

    List<Donation> findByBook(Book book);

    List<Donation> findByFundMode(FundMode fundMode);

    List<Donation> findByIdentification(DonorIdentification identification);

    List<Donation> findByEightyGStatus(EightyGStatus eightyGStatus);

    List<Donation> findByTenBdReportableFalse();

    long countByReceiptDateBetween(LocalDate start, LocalDate end);

    @Query("SELECT d FROM Donation d WHERE d.donationCode LIKE %:searchTerm% "
            + "OR d.donor.donorName LIKE %:searchTerm% OR d.transactionRef LIKE %:searchTerm%")
    List<Donation> searchByCodeDonorOrReference(@Param("searchTerm") String searchTerm);

    // Section 115BBC running total: sum of anonymous donations' reporting
    // amount within the financial year, used to compare against the moving
    // exemption limit (₹1,00,000 or 5% of total donations received, whichever
    // is higher).
    @Query("SELECT COALESCE(SUM(d.reportingAmountInr), 0) FROM Donation d "
            + "WHERE d.identification = com.ngo.finance.donation.enums.DonorIdentification.ANONYMOUS "
            + "AND d.receiptDate BETWEEN :fyStart AND :fyEnd")
    BigDecimal sumAnonymousReportingAmountInr(@Param("fyStart") LocalDate fyStart, @Param("fyEnd") LocalDate fyEnd);

    @Query("SELECT COALESCE(SUM(d.reportingAmountInr), 0) FROM Donation d "
            + "WHERE d.receiptDate BETWEEN :fyStart AND :fyEnd")
    BigDecimal sumReportingAmountInr(@Param("fyStart") LocalDate fyStart, @Param("fyEnd") LocalDate fyEnd);
}
