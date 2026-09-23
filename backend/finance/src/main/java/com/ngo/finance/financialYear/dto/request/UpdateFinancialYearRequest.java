package com.ngo.finance.financialYear.dto.request;

import java.time.LocalDate;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Request DTO for updating a financial year
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UpdateFinancialYearRequest {

    private String code;

    private LocalDate startDate;

    private LocalDate endDate;
}
