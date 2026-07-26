package com.ngo.finance.donation.dto.response;

import java.time.LocalDate;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TenantTaxConfigResponse {
    private Long id;
    private String org80gRegistrationNumber;
    private LocalDate org80gValidFrom;
    private LocalDate org80gValidTo;
    private String section35RegistrationNumber;
    private LocalDate section35ValidFrom;
    private LocalDate section35ValidTo;
    private Long receiptNumberSequence;
}
