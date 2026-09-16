package com.ngo.finance.donor.dto.response;

import com.fasterxml.jackson.annotation.JsonInclude;
import java.math.BigDecimal;
import java.time.LocalDate;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Response DTO for a grant tranche (expected vs actual receipt).
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@JsonInclude(JsonInclude.Include.NON_NULL)
public class TrancheResponse {

    private Long id;
    private Long grantId;
    private Integer trancheNumber;
    private String trancheName;
    private BigDecimal trancheAmount; // expected
    private LocalDate plannedReleaseDate;
    private BigDecimal actualAmount; // received
    private LocalDate actualReleaseDate;
    private String conditionsToRelease;
    private BigDecimal priorUtilisationRequired;
    private String conditionMet;
    private String trancheStatus;
    private BigDecimal utilisedAmount; // utilised up to the end of this tranche's period
    private LocalDate utilisationEndDate;

    // Receipt detail (Inflow Budget)
    private String bankReference;
    private String receiptVoucherNo;
    private String varianceReason;
    private BigDecimal actualFxRate;

    // Resolved from the owning grant/donor — not persisted on the entity.
    private String grantCode;
    private String grantCurrency;
    private BigDecimal fxLockedRate; // expected FX rate
    private Long donorId;
    private String donorName;
    /** LC | FC, from the donor's contribution type. */
    private String book;
    /** RESTRICTED | UNRESTRICTED, from the grant's fund profile. */
    private String fundMode;
}
