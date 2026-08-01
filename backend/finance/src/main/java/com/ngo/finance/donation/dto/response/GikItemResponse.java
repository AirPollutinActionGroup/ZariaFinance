package com.ngo.finance.donation.dto.response;

import com.fasterxml.jackson.annotation.JsonInclude;
import com.ngo.finance.donation.enums.GikIntendedUse;
import com.ngo.finance.donation.enums.GikRealisationStatus;
import com.ngo.finance.donation.enums.GikValuationBasis;
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
@JsonInclude(JsonInclude.Include.NON_NULL)
public class GikItemResponse {
    private Long id;
    private String itemDescription;
    private BigDecimal quantity;
    private BigDecimal fairValue;
    private GikValuationBasis valuationBasis;
    private String valuationSource;
    private GikIntendedUse intendedUse;
    private String treatment;
    private Long programmeId;
    private String programmeName;
    private String otherProgramme;
    private LocalDate expiryDate;
    private LocalDate liquidationDueDate;
    private GikRealisationStatus realisationStatus;
    private Boolean liquidationOverdue;
    private LocalDate actualSaleDate;
    private BigDecimal actualProceeds;
    private String matchingLeg;
}
