package com.ngo.finance.donor.dto.request;

import com.ngo.finance.donor.enums.FundClass;
import com.ngo.finance.donor.validator.annotation.ValidGrantDates;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import java.math.BigDecimal;
import java.time.LocalDate;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Request DTO for creating a Grant Agreement
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@ValidGrantDates
public class CreateGrantRequest {

    @NotBlank(message = "Grant code is required")
    private String grantCode;

    @NotNull(message = "Donor ID is required")
    private Long donorId;

    @NotNull(message = "Programme ID is required")
    private Long programmeId;

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

    @NotNull(message = "Fund class is required")
    private FundClass fundClass;

    private String description;

    private String agreementDocumentPath;
}
