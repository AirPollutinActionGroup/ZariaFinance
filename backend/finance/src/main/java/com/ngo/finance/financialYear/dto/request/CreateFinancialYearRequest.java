package com.ngo.finance.financialYear.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.time.LocalDate;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Request DTO for creating a new financial year
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CreateFinancialYearRequest {

    @NotBlank(message = "Financial year code is required")
    private String code;

    @NotNull(message = "Start date is required")
    private LocalDate startDate;

    @NotNull(message = "End date is required")
    private LocalDate endDate;

    /** Defaults to false when omitted. */
    private Boolean current;
}
