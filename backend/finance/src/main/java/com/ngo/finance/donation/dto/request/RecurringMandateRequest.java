package com.ngo.finance.donation.dto.request;

import com.ngo.finance.donation.enums.MandateFrequency;
import com.ngo.finance.donation.enums.MandateStatus;
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
public class RecurringMandateRequest {

    @NotBlank(message = "Mandate ID is required")
    private String mandateId;

    @NotNull(message = "Frequency is required")
    private MandateFrequency frequency;

    @NotNull(message = "Mandate start date is required")
    private LocalDate startDate;

    private MandateStatus mandateStatus;

    private LocalDate nextExpectedDebitDate;

    private String sponsorshipTie;
}
