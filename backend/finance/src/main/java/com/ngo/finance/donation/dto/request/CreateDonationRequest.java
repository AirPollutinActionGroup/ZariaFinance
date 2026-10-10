package com.ngo.finance.donation.dto.request;

import com.ngo.finance.donation.enums.DonationType;
import com.ngo.finance.donation.enums.UtilisationPeriodType;
import com.ngo.finance.donor.enums.FundClass;
import com.ngo.finance.donor.enums.FundMode;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
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
 * cross-field requiredness is enforced in the service layer, not here.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CreateDonationRequest {

    @NotNull(message = "Donation type is required")
    private DonationType donationType;

    @NotNull(message = "Donor is required")
    private Long donorId;

    @NotNull(message = "Fund mode is required")
    private FundMode fundMode;

    private FundClass fundClass;

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

    @NotNull(message = "Amount is required")
    @Positive(message = "Amount must be positive")
    private BigDecimal amount;

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
