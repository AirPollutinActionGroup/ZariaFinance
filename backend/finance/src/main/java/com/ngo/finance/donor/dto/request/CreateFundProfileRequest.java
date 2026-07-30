package com.ngo.finance.donor.dto.request;

import com.ngo.finance.donation.enums.FundMode;
import com.ngo.finance.donor.enums.CriterionType;
import com.ngo.finance.donor.enums.DisbursementType;
import com.ngo.finance.donor.enums.FundClass;
import com.ngo.finance.donor.enums.RepeatReminder;
import com.ngo.finance.donor.enums.ReportingFrequency;
import com.ngo.finance.donor.enums.RestrictionRuleType;
import com.ngo.finance.donor.enums.ScheduleType;
import com.ngo.finance.donor.enums.TriggerBasis;
import com.ngo.finance.donor.enums.VerificationRole;
import com.ngo.finance.donor.validator.annotation.ValidFundProfile;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Request DTO for creating / updating a Donor Fund Profile (workbook sheet 03),
 * with its spendable-location, utilisation and disbursement rules embedded. The
 * owning donor is taken from the URL path, not this body.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@ValidFundProfile
public class CreateFundProfileRequest {

    @NotNull(message = "Fund mode is required")
    private FundMode fundMode;

    /** A/B/C restriction class; nullable for edge/pending profiles. */
    private FundClass fundClass;

    private String purpose;

    @Builder.Default
    private Boolean programmeTied = false;

    private Long programmeId; // nullable: blank = untied / not-yet-tagged

    private ReportingFrequency reportingFrequency;

    @Builder.Default
    private Boolean movementAllowed = false;

    @Builder.Default
    private Boolean explanationRequired = false;

    @Builder.Default
    private Boolean onboardingComplete = false;

    /** State ids the fund may be spent in; empty = spendable anywhere. */
    @Builder.Default
    private List<Long> stateIds = new ArrayList<>();

    @Valid
    @Builder.Default
    private List<UtilisationRuleItem> utilisationRules = new ArrayList<>();

    @Valid
    @Builder.Default
    private List<DisbursementRuleItem> disbursementRules = new ArrayList<>();

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class GeographyItem {
        private Long id;

        @NotNull(message = "State is required")
        private Long stateId;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class UtilisationRuleItem {
        private Long id;

        @NotNull(message = "Rule type is required")
        private RestrictionRuleType ruleType;

        /** Required only when ruleType == OTHER_CUSTOM; see FundProfileValidator. */
        private String otherRuleType;

        private BigDecimal limitPercentage;
        private String description;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class DisbursementRuleItem {
        private Long id;

        private BigDecimal totalAmount;

        @NotNull(message = "Disbursement type is required")
        private DisbursementType disbursementType;

        @Valid
        @Builder.Default
        private List<TrancheCriterionItem> trancheCriteria = new ArrayList<>();
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class TrancheCriterionItem {
        private Long id;

        @NotNull(message = "Tranche amount is required")
        @Positive(message = "Tranche amount must be positive")
        private BigDecimal amountCriteria;

        private LocalDate expectedReleaseDate;

        @Builder.Default
        private ScheduleType frequency = ScheduleType.MONTHLY;

        @Builder.Default
        private Boolean isFinalTranche = false;

        @NotNull(message = "Release criteria is required")
        private CriterionType releaseCriteria;

        /** FIXED_DATE. */
        private LocalDate releaseDate;

        /** MILESTONE_BASED. */
        private String milestoneName;
        private VerificationRole verificationSignOffRole;
        private String otherVerificationSignOffRole;
        private LocalDate targetDate;

        /** UTILISATION_THRESHOLD. */
        private Double utilisationPercentage;
        private TriggerBasis triggerBasis;

        /** Optional for UTILISATION_THRESHOLD, mandatory for OTHER. */
        private String description;

        /** Reminder block — only meaningful when remindSomeone is true. */
        @Builder.Default
        private Boolean remindSomeone = false;
        private VerificationRole responsibleRole;
        private String otherResponsibleRole;
        private Integer reminderLeadTime;
        @Builder.Default
        private RepeatReminder repeatReminder = RepeatReminder.ONCE;
        @Builder.Default
        private Boolean escalateToDeputy = false;
    }
}
