package com.ngo.finance.donor.dto.request;

import com.ngo.finance.donor.enums.ApproverRole;
import com.ngo.finance.donor.enums.CriterionType;
import com.ngo.finance.donor.enums.DisbursementType;
import com.ngo.finance.donor.enums.ReportingFrequency;
import com.ngo.finance.donor.enums.RestrictionRuleType;
import com.ngo.finance.donor.enums.ScheduleFrequency;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
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
public class CreateFundProfileRequest {

    @NotBlank(message = "Fund mode is required")
    private String fundMode; // 'Restricted' | 'Unrestricted'

    @Pattern(regexp = "^[ABC]$", message = "Fund class code must be A, B or C")
    private String fundClassCode; // nullable for edge/pending profiles

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

    // The donor-agreed release schedule; Σ trancheAmount becomes the Total Grant
    // Amount of every grant on this profile.
    @Valid
    @Builder.Default
    private List<TrancheItem> tranches = new ArrayList<>();

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class UtilisationRuleItem {
        @NotNull(message = "Rule type is required")
        private RestrictionRuleType ruleType;
        private String otherRuleType;
        private BigDecimal limitPercentage;
        private String description;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class DisbursementRuleItem {
        @NotBlank(message = "Total amount committed is required")
        private String totalAmountCommitted;

        @NotNull(message = "Disbursement type is required")
        private DisbursementType disbursementType;

        @Valid
        @Builder.Default
        private List<TrancheDetailItem> trancheDetail = new ArrayList<>();
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class TrancheDetailItem {
        @NotBlank(message = "Tranche amount is required")
        private String amount;

        @NotNull(message = "Tranche frequency is required")
        private ScheduleFrequency frequency;

        @Builder.Default
        private Boolean isFinalTranche = false;

        @NotNull(message = "Release criteria is required")
        private CriterionType releaseCriteria;

        private LocalDate releaseDate;
        private String milestoneName;
        private ApproverRole signOfRole;
        private String otherSignOfRole;
        private LocalDate targetDate;
        private String utilisationPercentage;
        private String triggerBase;
        private String description;
        private ApproverRole responsibleRole;
        private String otherResponsibleRole;
        private String reminderLeadTime;
        private String repeatReminder;

        @Builder.Default
        private Boolean escalateToDeputy = false;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class TrancheItem {
        // Optional: renumbered 1..n in list order when omitted.
        private Integer trancheNumber;
        private String trancheName;
        @NotNull(message = "Tranche amount is required")
        @Positive(message = "Tranche amount must be positive")
        private BigDecimal trancheAmount;
        private LocalDate plannedReleaseDate;
    }
}
