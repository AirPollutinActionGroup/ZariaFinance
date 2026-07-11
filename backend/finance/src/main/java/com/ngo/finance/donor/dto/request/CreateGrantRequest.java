package com.ngo.finance.donor.dto.request;

import com.ngo.finance.donor.validator.annotation.ValidGrantDates;
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

/**
 * Request DTO for creating / updating a Grant Agreement.
 *
 * A grant inherits its donor, programme and fund class from its fund profile,
 * so only {@code fundProfileId} is supplied — donorId / programmeId / fundClass
 * are derived server-side. Foreign grants carry a currency and a locked FX rate;
 * the INR reporting amount is computed on the server.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@ValidGrantDates
public class CreateGrantRequest {

    @NotBlank(message = "Grant code is required")
    private String grantCode;

    @NotNull(message = "Fund profile is required")
    private Long fundProfileId;

    @NotBlank(message = "Agreement name is required")
    private String agreementName;

    @NotNull(message = "Agreement date is required")
    private LocalDate agreementDate;

    @NotNull(message = "Start date is required")
    private LocalDate startDate;

    @NotNull(message = "End date is required")
    private LocalDate endDate;

    @NotNull(message = "Total grant amount is required")
    @Positive(message = "Total grant amount must be positive")
    private BigDecimal totalGrantAmount;

    private String grantCurrency; // defaults to INR server-side

    @PositiveOrZero(message = "FX locked rate must be zero or positive")
    private BigDecimal fxLockedRate; // defaults to 1 server-side

    private String description;

    private String agreementDocumentPath;
}
