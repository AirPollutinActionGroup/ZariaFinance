package com.ngo.finance.donor.dto.response;

import com.fasterxml.jackson.annotation.JsonInclude;
import com.ngo.finance.donor.enums.GrantStatus;
import java.math.BigDecimal;
import java.time.LocalDate;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Response DTO for Grant Agreement List
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@JsonInclude(JsonInclude.Include.NON_NULL)
public class GrantListResponse {

    private Long id;

    private String grantCode;

    private String donorName;

    private String programmeName;

    private String agreementName;

    private LocalDate startDate;

    private LocalDate endDate;

    private BigDecimal totalGrantAmount;

    private String fundClassCode;

    private String grantCurrency;

    private BigDecimal reportingAmountInr;

    private GrantStatus grantStatus;
}
