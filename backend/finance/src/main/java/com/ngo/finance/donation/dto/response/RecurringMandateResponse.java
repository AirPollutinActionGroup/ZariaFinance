package com.ngo.finance.donation.dto.response;

import com.fasterxml.jackson.annotation.JsonInclude;
import com.ngo.finance.donation.enums.MandateFrequency;
import com.ngo.finance.donation.enums.MandateStatus;
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
public class RecurringMandateResponse {
    private String mandateId;
    private MandateFrequency frequency;
    private LocalDate startDate;
    private MandateStatus mandateStatus;
    private LocalDate nextExpectedDebitDate;
    private String sponsorshipTie;
}
