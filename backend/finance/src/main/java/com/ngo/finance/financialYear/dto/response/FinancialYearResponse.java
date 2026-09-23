package com.ngo.finance.financialYear.dto.response;

import com.fasterxml.jackson.annotation.JsonInclude;
import java.time.LocalDate;
import java.time.LocalDateTime;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Response DTO for Financial Year
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@JsonInclude(JsonInclude.Include.NON_NULL)
public class FinancialYearResponse {

    private Long id;

    private String code;

    private LocalDate startDate;

    private LocalDate endDate;

    private Boolean current;

    /** Derived from today's date against the period: ACTIVE, UPCOMING or CLOSED. */
    private String status;

    private LocalDateTime createdAt;

    private LocalDateTime updatedAt;

    private String createdBy;

    private String updatedBy;
}
