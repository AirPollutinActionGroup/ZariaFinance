package com.ngo.finance.donor.dto.request;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import java.math.BigDecimal;
import java.time.LocalDate;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Request DTO for scheduling a grant tranche (the expected/planned receipt).
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CreateTrancheRequest {

    @NotNull(message = "Tranche number is required")
    private Integer trancheNumber;

    private String trancheName;

    @NotNull(message = "Expected amount is required")
    @Positive(message = "Expected amount must be positive")
    private BigDecimal trancheAmount; // expected amount

    private LocalDate plannedReleaseDate;

    private String conditionsToRelease;

    private BigDecimal priorUtilisationRequired; // gate % (e.g. 75.00)
}
