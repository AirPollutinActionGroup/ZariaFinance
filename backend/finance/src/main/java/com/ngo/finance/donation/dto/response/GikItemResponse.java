package com.ngo.finance.donation.dto.response;

import com.fasterxml.jackson.annotation.JsonInclude;
import com.ngo.finance.donation.enums.GikIntendedUse;
import com.ngo.finance.donation.enums.GikRealisationStatus;
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
    private BigDecimal fairValue;
    private GikIntendedUse intendedUse;
    private LocalDate expiryDate;
    private LocalDate liquidationDueDate;
    private GikRealisationStatus realisationStatus;
    private Boolean liquidationOverdue;
}
