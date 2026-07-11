package com.ngo.finance.donor.dto.response;

import java.math.BigDecimal;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Dashboard summary — donor / grant counts and the funding chain, computed
 * server-side from live records. "Received" is real (sum of actual tranche
 * receipts); "utilised" is the seeded placeholder until an actuals module ships.
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

    // Funding chain (INR). committed/received/utilised exclude blocked commitments.
    private BigDecimal committed; // Σ reporting_amount_inr (receivable)
    private BigDecimal received;  // Σ tranche.actual_amount (realised)
    private BigDecimal utilised;  // Σ grant.utilised_amount (illustrative)
    private BigDecimal available; // received − utilised
    private BigDecimal open;      // committed − received
    private BigDecimal blocked;   // commitments on inactive / draft donors
}
