package com.ngo.finance.donor.dto.request;

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
 * with its geography, utilisation and disbursement rules embedded. The owning
 * donor is taken from the URL path, not this body.
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

    private String reportingFrequency; // 'Quarterly' | 'Half-yearly' | 'Annual'

    @Builder.Default
    private Boolean adminAllowed = true;

    private BigDecimal overheadLimitPercent;

    @Builder.Default
    private Boolean movementAllowed = false;

    @Builder.Default
    private Boolean explanationRequired = false;

    @Builder.Default
    private Boolean onboardingComplete = false;

    @Valid
    @Builder.Default
    private List<GeographyItem> geographies = new ArrayList<>();

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
    public static class GeographyItem {
        @NotBlank(message = "Geography name is required")
        private String geographyName;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class UtilisationRuleItem {
        @NotBlank(message = "Rule type is required")
        private String ruleType;
        private BigDecimal limitPercentage;
        private String description;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class DisbursementRuleItem {
        @NotBlank(message = "Rule type is required")
        private String ruleType;
        private String releaseTrigger;
        private BigDecimal minPriorUtilisationRequired;
        @Builder.Default
        private Boolean milestoneRequired = false;
        private String ruleDescription;
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
