package com.ngo.finance.donor.dto.response;

import com.fasterxml.jackson.annotation.JsonInclude;
import com.ngo.finance.donor.enums.FundClass;
import com.ngo.finance.donor.enums.GrantStatus;
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

    private String agreementName;

    private LocalDate agreementDate;

    private LocalDate startDate;

    private LocalDate endDate;

    private BigDecimal totalGrantAmount;

    private FundClass fundClass;

    private GrantStatus grantStatus;

    private String description;

    private String agreementDocumentPath;

    private LocalDateTime createdAt;

    private LocalDateTime updatedAt;

    private String createdBy;

    private String updatedBy;
}
