package com.ngo.finance.fx.dto;

import java.math.BigDecimal;
import java.time.LocalDate;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * A rate lookup result. {@code rateToInr} is null when no rate could be found —
 * callers (the grant form) then leave the field for manual entry rather than
 * treating it as an error.
 *
 * {@code rateDate} is the date the returned rate actually belongs to, which may
 * be earlier than the requested date when the fallback served a stale rate;
 * {@code stale} says which happened.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class FxRateResponse {

    private String currency;

    private LocalDate requestedDate;

    private LocalDate rateDate;

    private BigDecimal rateToInr;

    /** 'PAR' (INR), 'RBI', 'SEED', 'MANUAL' or 'UNAVAILABLE'. */
    private String source;

    private Boolean stale;
}
