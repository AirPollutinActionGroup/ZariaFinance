package com.ngo.finance.donation.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.time.LocalDate;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TenantTaxConfigRequest {

    @NotBlank(message = "80G registration number is required")
    private String org80gRegistrationNumber;

    @NotNull(message = "80G validity start is required")
    private LocalDate org80gValidFrom;

    @NotNull(message = "80G validity end is required")
    private LocalDate org80gValidTo;

    private String section35RegistrationNumber;
    private LocalDate section35ValidFrom;
    private LocalDate section35ValidTo;
}
