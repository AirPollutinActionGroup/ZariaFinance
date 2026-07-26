package com.ngo.finance.donation.dto.request;

import com.ngo.finance.donation.enums.GikIntendedUse;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import java.math.BigDecimal;
import java.time.LocalDate;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class GikItemRequest {

    @NotBlank(message = "Item description is required")
    private String itemDescription;

    @NotNull(message = "Fair value is required")
    @Positive(message = "Fair value must be positive")
    private BigDecimal fairValue;

    @NotNull(message = "Intended use is required")
    private GikIntendedUse intendedUse;

    private LocalDate expiryDate;
}
