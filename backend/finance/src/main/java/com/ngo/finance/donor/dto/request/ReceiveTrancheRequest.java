package com.ngo.finance.donor.dto.request;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.PositiveOrZero;
import java.math.BigDecimal;
import java.time.LocalDate;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Request DTO for recording an actual tranche receipt — this is what makes the
 * money "received" and drives the dashboard funding chain.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ReceiveTrancheRequest {

    @NotNull(message = "Actual amount is required")
    @PositiveOrZero(message = "Actual amount must be zero or positive")
    private BigDecimal actualAmount;

    private LocalDate actualDate;
}
