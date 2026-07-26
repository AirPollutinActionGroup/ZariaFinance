package com.ngo.finance.donation.dto.response;

import com.fasterxml.jackson.annotation.JsonInclude;
import com.ngo.finance.donation.enums.Book;
import com.ngo.finance.donation.enums.DonationBankAccountType;
import com.ngo.finance.donation.enums.DonationChannel;
import com.ngo.finance.donation.enums.DonationType;
import com.ngo.finance.donation.enums.DonorIdentification;
import com.ngo.finance.donation.enums.EightyGStatus;
import com.ngo.finance.donation.enums.FundMode;
import com.ngo.finance.donation.enums.RecognitionStatus;
import com.ngo.finance.donation.enums.TenBeStatus;
import com.ngo.finance.donation.enums.UtilisationPeriodType;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@JsonInclude(JsonInclude.Include.NON_NULL)
public class DonationDetailResponse {
    private Long id;
    private String donationCode;
    private DonationType donationType;
    private LocalDate receiptDate;
    private DonationChannel channel;
    private Book book;

    private Long donorId;
    private String donorName;
    private String donorPanCardNumber;
    private String donorAddress;
    private DonorIdentification identification;
    private String anonymousCollectionSource;
    private String anonymousSourceReference;
    // Populated only when identification = ANONYMOUS (Section 115BBC).
    private BigDecimal anonymousFyRunningTotal;
    private BigDecimal anonymousFyLimit;

    private FundMode fundMode;
    private String fundClassCode;
    private Long programmeId;
    private String programmeName;
    private List<String> stateNames;
    private UtilisationPeriodType utilisationPeriodType;
    private LocalDate utilisationStartDate;
    private LocalDate utilisationEndDate;
    private Boolean isConditionalGift;
    private String conditionDescription;

    private String currency;
    private BigDecimal amount;
    private BigDecimal fxRate;
    private BigDecimal reportingAmountInr;
    private DonationBankAccountType bankAccountType;
    private String transactionRef;
    private String tallyVoucherRef;

    private RecognitionStatus recognitionStatus;

    private EightyGStatus eightyGStatus;
    private String eightyGReceiptNumber;
    private LocalDateTime eightyGIssuedAt;
    private Boolean tenBdReportable;
    private String tenBdFailureReason;
    private TenBeStatus tenBeStatus;

    private List<GikItemResponse> gikItems;
    private CorpusDetailResponse corpusDetail;
    private RecurringMandateResponse recurringMandate;
    private PayrollBatchResponse payrollBatch;
    private LegacyDetailResponse legacyDetail;

    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private String createdBy;
    private String updatedBy;
}
