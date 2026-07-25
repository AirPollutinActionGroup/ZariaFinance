package com.ngo.finance.donor.dto.response;

import java.math.BigDecimal;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Funding committed / received split into one statutory bucket
 * (FC — Foreign Contribution, DC — Domestic Contribution, CSR).
 * The three buckets partition the non-blocked grants, so their committed /
 * received figures each sum back to the dashboard funding-chain totals.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class FundingClassBreakdown {

    private String bucket; // 'FC' | 'DC' | 'CSR'
    private String label;  // human-readable name
    private long grantCount;
    private BigDecimal committed; // Σ reporting_amount_inr for the bucket
    private BigDecimal received;  // Σ tranche.actual_amount (INR) for the bucket
}
