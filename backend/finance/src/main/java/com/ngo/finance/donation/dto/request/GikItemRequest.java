package com.ngo.finance.donation.dto.request;

import com.ngo.finance.donation.enums.GikIntendedUse;
import com.ngo.finance.donation.enums.GikRealisationStatus;
import com.ngo.finance.donation.enums.GikValuationBasis;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.PositiveOrZero;
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

    @PositiveOrZero(message = "Quantity must be zero or positive")
    private BigDecimal quantity;

    @NotNull(message = "Fair value is required")
    @Positive(message = "Fair value must be positive")
    private BigDecimal fairValue;

    private GikValuationBasis valuationBasis;

    private String valuationSource;

    @NotNull(message = "Intended use is required")
    private GikIntendedUse intendedUse;

    private String treatment;

    private Long programmeId;

    private String otherProgramme;

    private LocalDate expiryDate;

    private GikRealisationStatus realisationStatus;

    private LocalDate actualSaleDate;

    @PositiveOrZero(message = "Actual proceeds must be zero or positive")
    private BigDecimal actualProceeds;

    private String matchingLeg;
}
