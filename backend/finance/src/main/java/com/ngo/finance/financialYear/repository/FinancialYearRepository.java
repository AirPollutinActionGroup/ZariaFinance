package com.ngo.finance.financialYear.repository;

import com.ngo.finance.financialYear.entity.FinancialYear;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

@Repository
public interface FinancialYearRepository extends JpaRepository<FinancialYear, Long> {

    boolean existsByCodeIgnoreCase(String code);

    Optional<FinancialYear> findByCurrentTrue();

    List<FinancialYear> findAllByOrderByStartDateAsc();

    @Query("SELECT f FROM FinancialYear f WHERE f.startDate <= :endDate AND f.endDate >= :startDate")
    List<FinancialYear> findOverlapping(@Param("startDate") LocalDate startDate, @Param("endDate") LocalDate endDate);
}
