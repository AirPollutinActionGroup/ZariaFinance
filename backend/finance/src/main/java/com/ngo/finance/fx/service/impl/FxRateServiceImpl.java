package com.ngo.finance.fx.service.impl;

import com.ngo.finance.fx.dto.FxRateResponse;
import com.ngo.finance.fx.entity.FxRate;
import com.ngo.finance.fx.repository.FxRateRepository;
import com.ngo.finance.fx.service.FxRateProvider;
import com.ngo.finance.fx.service.FxRateService;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Limit;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 * Resolves a rate in four steps, cheapest first: INR at par, the cached row for
 * the exact date, a provider fetch (cached on success), then the latest cached
 * rate before the requested date marked stale.
 */
@Slf4j
@Service
@Transactional
public class FxRateServiceImpl implements FxRateService {

    static final String INR = "INR";

    @Autowired
    private FxRateRepository fxRateRepository;

    @Autowired
    private FxRateProvider provider;

    @Override
    public FxRateResponse getRate(String currency, LocalDate date) {
        String code = currency == null ? INR : currency.trim().toUpperCase();
        LocalDate on = date != null ? date : LocalDate.now();

        if (INR.equals(code)) {
            return response(code, on, on, BigDecimal.ONE, "PAR", false);
        }

        Optional<FxRate> exact = fxRateRepository.findByCurrencyAndRateDate(code, on);
        if (exact.isPresent()) {
            FxRate hit = exact.get();
            return response(code, on, hit.getRateDate(), hit.getRateToInr(), hit.getSource(), false);
        }

        Optional<BigDecimal> fetched = provider.fetchRate(code, on);
        if (fetched.isPresent()) {
            FxRate saved = fxRateRepository.save(FxRate.builder()
                    .currency(code)
                    .rateDate(on)
                    .rateToInr(fetched.get())
                    .source(provider.sourceName())
                    .build());
            log.info("Cached {} rate for {} on {}", provider.sourceName(), code, on);
            return response(code, on, saved.getRateDate(), saved.getRateToInr(), saved.getSource(), false);
        }

        List<FxRate> previous = fxRateRepository
                .findByCurrencyAndRateDateLessThanEqualOrderByRateDateDesc(code, on, Limit.of(1));
        if (!previous.isEmpty()) {
            FxRate fallback = previous.get(0);
            return response(code, on, fallback.getRateDate(), fallback.getRateToInr(), fallback.getSource(), true);
        }

        log.warn("No FX rate available for {} on {} — falling back to manual entry", code, on);
        return response(code, on, null, null, "UNAVAILABLE", false);
    }

    private FxRateResponse response(String currency, LocalDate requested, LocalDate rateDate,
            BigDecimal rate, String source, boolean stale) {
        return FxRateResponse.builder()
                .currency(currency)
                .requestedDate(requested)
                .rateDate(rateDate)
                .rateToInr(rate)
                .source(source)
                .stale(stale)
                .build();
    }
}
