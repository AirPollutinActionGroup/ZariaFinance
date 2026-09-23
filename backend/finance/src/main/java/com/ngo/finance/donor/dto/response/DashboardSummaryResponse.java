package com.ngo.finance.donor.dto.response;

import java.math.BigDecimal;
import java.util.List;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Dashboard summary — donor / grant counts and the funding chain, computed
 * server-side from live records.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DashboardSummaryResponse {

    private long donorCount;
    private long activeDonorCount;
    private long draftDonorCount;
    private BigDecimal draftBlockingAmount;

    private long grantCount;
    private long activeGrantCount;
    private long closedGrantCount;
    private long blockedGrantCount;

    // Funding chain (INR). committed excludes blocked commitments.
    private BigDecimal committed; // Σ grant.total_grant_amount (receivable)
    private BigDecimal blocked;   // commitments on inactive / draft donors

    // Committed split into the FC / DC / CSR statutory buckets. The buckets
    // partition the same non-blocked grants as the funding chain, so their
    // committed figures sum back to `committed`.
    private List<FundingClassBreakdown> fundingByClass;
}
