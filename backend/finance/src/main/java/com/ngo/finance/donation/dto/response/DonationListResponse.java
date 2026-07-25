package com.ngo.finance.donation.dto.response;

import com.fasterxml.jackson.annotation.JsonInclude;
import com.ngo.finance.donation.enums.Book;
import com.ngo.finance.donation.enums.DonationType;
import com.ngo.finance.donation.enums.DonorIdentification;
import com.ngo.finance.donation.enums.EightyGStatus;
import com.ngo.finance.donation.enums.FundMode;
import com.ngo.finance.donation.enums.RecognitionStatus;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/** One row of the donations register. */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@JsonInclude(JsonInclude.Include.NON_NULL)
public class DonationListResponse {
    private Long id;
    private String donationCode;
    private LocalDate receiptDate;
    private DonationType donationType;
    private Long donorId;
    private String donorName; // "Anonymous" when identification = ANONYMOUS
    private DonorIdentification identification;
    private BigDecimal amount;
    private String currency;
    private BigDecimal reportingAmountInr;
    private FundMode fundMode;
    private Book book;
    private List<String> stateNames;
    private EightyGStatus eightyGStatus;
    private Boolean tenBdReportable;
    private RecognitionStatus recognitionStatus;
}
