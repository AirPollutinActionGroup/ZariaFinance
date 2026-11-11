package com.ngo.finance.fundsuggestion.dto.response;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * One donor → fund profile → grant a debit note could be charged to, ranked
 * best first. Grant fields are null when the fund has no grant agreement;
 * the "after" fields are null when no amount was given.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class FundSuggestionResponse {

    /** 1 = best. */
    private int rank;

    /** Sum of the ranking weights the fund earned (see FundSuggestionRanker). */
    private int score;

    private Long donorId;

    private String donorName;

    private Long fundProfileId;

    private String fundProfileName;

    /** CLASS_A_RESTRICTED / CLASS_B_UNRESTRICTED / CLASS_C_UNRESTRICTED. */
    private String fundClass;

    private Long grantId;

    private String grantCode;

    private String grantName;

    private LocalDate grantEndDate;

    private BigDecimal grantTotal;

    /** Credit notes received into the fund. */
    private BigDecimal received;

    /** Debit notes already charged to the fund. */
    private BigDecimal debited;

    /** received − debited. */
    private BigDecimal available;

    private BigDecimal availableAfter;

    private Boolean coversAmount;

    /** Share of what was received that's used once this debit is charged, 0–100. */
    private BigDecimal utilisationAfterPct;

    /** Debit notes on this budget line already charged to the fund. */
    private long usesOnLine;

    private List<String> reasons;

    private List<String> warnings;
}
