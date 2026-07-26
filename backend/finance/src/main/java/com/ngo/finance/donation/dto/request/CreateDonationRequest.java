package com.ngo.finance.donation.dto.request;

import com.ngo.finance.donation.enums.DonationBankAccountType;
import com.ngo.finance.donation.enums.DonationChannel;
import com.ngo.finance.donation.enums.DonationType;
import com.ngo.finance.donation.enums.DonorIdentification;
import com.ngo.finance.donation.enums.FundMode;
import com.ngo.finance.donation.enums.UtilisationPeriodType;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.PositiveOrZero;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Request DTO for creating / updating a Donation.
 *
 * {@code donationCode} is never supplied here — it is auto-generated
 * server-side. Which of the type-specific blocks ({@code gikItems},
 * {@code corpusDetail}, {@code recurringMandate}, {@code payrollBatch},
 * {@code legacyDetail}) is required depends on {@code donationType}; that
 * cross-field requiredness is enforced in the service layer, not here, since
 * the exact rules (e.g. which donation types are blocked when anonymous) are
 * business rules rather than simple per-field constraints.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CreateDonationRequest {

    @NotNull(message = "Donation type is required")
    private DonationType donationType;

    @NotNull(message = "Receipt date is required")
    private LocalDate receiptDate;

    @NotNull(message = "Channel is required")
    private DonationChannel channel;

    @NotNull(message = "Donor identification is required")
    private DonorIdentification identification;

    // Required when identification = NAMED.
    private Long donorId;

    // Required when identification = ANONYMOUS.
    private String anonymousCollectionSource;
    private String anonymousSourceReference;

    @NotNull(message = "Fund mode is required")
    private FundMode fundMode;

    private String fundClassCode;

    private Long programmeId;

    @NotEmpty(message = "At least one location/state is required")
    private List<Long> stateIds;

    @NotNull(message = "Utilisation period is required")
    private UtilisationPeriodType utilisationPeriodType;

    private LocalDate utilisationStartDate;
    private LocalDate utilisationEndDate;

    @Builder.Default
    private Boolean isConditionalGift = false;

    private String conditionDescription;

    @NotNull(message = "Currency is required")
    private String currency;

    @NotNull(message = "Amount is required")
    @Positive(message = "Amount must be positive")
    private BigDecimal amount;

    @PositiveOrZero(message = "FX rate must be zero or positive")
    private BigDecimal fxRate; // defaults to 1 server-side

    @NotNull(message = "Bank account type is required")
    private DonationBankAccountType bankAccountType;

    private String transactionRef;
    private String tallyVoucherRef;

    // ── Type-specific blocks — exactly one populated, matching donationType ─
    @Valid
    private List<GikItemRequest> gikItems;

    @Valid
    private CorpusDetailRequest corpusDetail;

    @Valid
    private RecurringMandateRequest recurringMandate;

    @Valid
    private PayrollBatchRequest payrollBatch;

    @Valid
    private LegacyDetailRequest legacyDetail;
}
