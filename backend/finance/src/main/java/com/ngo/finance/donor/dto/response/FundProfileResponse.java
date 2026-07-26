package com.ngo.finance.donor.dto.response;

import com.fasterxml.jackson.annotation.JsonInclude;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Response DTO for a Donor Fund Profile with its embedded rule collections.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@JsonInclude(JsonInclude.Include.NON_NULL)
public class FundProfileResponse {

    private Long id;
    private Long donorId;
    private String donorName;
    private String fundMode;
    private String fundClassCode;
    private String purpose;
    private Boolean programmeTied;
    private Long programmeId;
    private String programmeName;
    private String reportingFrequency;
    private Boolean adminAllowed;
    private BigDecimal overheadLimitPercent;
    private Boolean movementAllowed;
    private Boolean explanationRequired;
    private Boolean onboardingComplete;
    private List<GeographyItem> geographies;
    private List<UtilisationRuleItem> utilisationRules;
    private List<DisbursementRuleItem> disbursementRules;
    private List<TrancheItem> tranches;
    // Σ tranche amounts — the Total Grant Amount inherited by grants on this profile.
    private BigDecimal plannedTotalAmount;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class GeographyItem {
        private Long id;
        private String geographyName;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class UtilisationRuleItem {
        private Long id;
        private String ruleType;
        private BigDecimal limitPercentage;
        private String description;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class DisbursementRuleItem {
        private Long id;
        private String ruleType;
        private String releaseTrigger;
        private BigDecimal minPriorUtilisationRequired;
        private Boolean milestoneRequired;
        private String ruleDescription;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class TrancheItem {
        private Long id;
        private Integer trancheNumber;
        private String trancheName;
        private BigDecimal trancheAmount;
        private LocalDate plannedReleaseDate;
    }
}
