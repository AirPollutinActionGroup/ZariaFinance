package com.ngo.finance.donor.dto.response;

import com.fasterxml.jackson.annotation.JsonInclude;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Response DTO for Grant Agreement Details
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@JsonInclude(JsonInclude.Include.NON_NULL)
public class GrantDetailsResponse {

    private Long id;

    private String grantCode;

    private Long donorId;

    private String donorName;

    private Long programmeId;

    private String programmeName;

    private Long fundProfileId;

    private String fundClassCode;

    private String agreementName;

    private LocalDate agreementDate;

    private LocalDate startDate;

    private LocalDate endDate;

    private BigDecimal totalGrantAmount;

    private String grantCurrency;

    private BigDecimal fxLockedRate;

    private BigDecimal reportingAmountInr;

    private BigDecimal utilisedAmount;

    // Agreement status (section 1): ACTIVE | COMPLETED | CANCELLED. isActive is
    // the legacy boolean mirror, kept for existing consumers.
    private String status;

    private Boolean isActive;

    private String description;

    private String agreementDocumentPath;

    private LocalDateTime createdAt;

    private LocalDateTime updatedAt;

    private String createdBy;

    private String updatedBy;

    private Long approvedBy;

    /** Resolved from the users table so the UI never has to show a bare id. */
    private String approvedByName;

    private String approvalRemarks;

    private Integer isApproved;

    private LocalDateTime approvalDate;
}
