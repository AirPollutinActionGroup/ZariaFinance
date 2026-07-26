package com.ngo.finance.fx.repository;

import com.ngo.finance.fx.entity.FxRate;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import org.springframework.data.domain.Limit;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface FxRateRepository extends JpaRepository<FxRate, Long> {

    Optional<FxRate> findByCurrencyAndRateDate(String currency, LocalDate rateDate);

    /** Most recent cached rate on or before {@code date} — the staleness fallback. */
    List<FxRate> findByCurrencyAndRateDateLessThanEqualOrderByRateDateDesc(
            String currency, LocalDate date, Limit limit);
}
