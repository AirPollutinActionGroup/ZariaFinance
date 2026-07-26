package com.ngo.finance.fx.service;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.Optional;

/**
 * Fetches a reference rate to INR from outside the system. Implemented by
 * {@link RbiFxRateProvider}; kept as an interface so the RBI feed can be swapped
 * or stubbed without touching {@link FxRateService}.
 */
public interface FxRateProvider {

    /** The rate for {@code currency} on {@code date}, or empty when unavailable. */
    Optional<BigDecimal> fetchRate(String currency, LocalDate date);

    /** Label recorded on rows this provider supplies (e.g. 'RBI'). */
    String sourceName();
}
