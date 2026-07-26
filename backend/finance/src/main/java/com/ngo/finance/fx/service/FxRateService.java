package com.ngo.finance.fx.service;

import com.ngo.finance.fx.dto.FxRateResponse;
import java.time.LocalDate;

/** Reference-rate lookups to INR for the grant agreement's locked FX rate. */
public interface FxRateService {

    /**
     * The best rate available for {@code currency} on {@code date}: INR at par,
     * else the cached row for that exact date, else a freshly fetched provider
     * rate, else the most recent cached rate before that date (flagged stale).
     * Never throws for a missing rate — the response carries a null rate instead.
     */
    FxRateResponse getRate(String currency, LocalDate date);
}
