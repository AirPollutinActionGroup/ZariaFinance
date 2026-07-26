package com.ngo.finance.fx.entity;

import com.ngo.finance.common.entity.AuditEntity;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;
import java.math.BigDecimal;
import java.time.LocalDate;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;

/**
 * A cached reference rate to INR for one currency on one date.
 *
 * These are lookups, not ledger entries — a grant locks its rate into
 * {@code grant_agreement.fx_locked_rate} at signing, so a later correction here
 * cannot move an existing grant's reporting amount.
 */
@Entity
@Table(name = "fx_rate")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@EqualsAndHashCode(callSuper = true)
public class FxRate extends AuditEntity {

    @Column(nullable = false, length = 10)
    private String currency;

    @Column(name = "rate_date", nullable = false)
    private LocalDate rateDate;

    @Column(name = "rate_to_inr", nullable = false, precision = 12, scale = 4)
    private BigDecimal rateToInr;

    /** 'RBI' when fetched from the reference feed, 'SEED' / 'MANUAL' otherwise. */
    @Column(nullable = false, length = 50)
    private String source;
}
