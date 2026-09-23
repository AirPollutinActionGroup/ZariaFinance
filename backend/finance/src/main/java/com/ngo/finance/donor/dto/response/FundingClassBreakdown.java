package com.ngo.finance.donor.dto.response;

import java.math.BigDecimal;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Funding committed split into one statutory bucket
 * (FC — Foreign Contribution, DC — Domestic Contribution, CSR).
 * The three buckets partition the non-blocked grants, so their committed
 * figures sum back to the dashboard funding-chain total.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class FundingClassBreakdown {

    private String bucket; // 'FC' | 'DC' | 'CSR'
    private String label;  // human-readable name
    private long grantCount;
    private BigDecimal committed; // Σ grant.total_grant_amount for the bucket
}
