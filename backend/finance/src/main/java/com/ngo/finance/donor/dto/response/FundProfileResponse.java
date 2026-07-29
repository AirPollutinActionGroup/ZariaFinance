package com.ngo.finance.donor.dto.response;

import com.fasterxml.jackson.annotation.JsonInclude;
import com.ngo.finance.donor.enums.ApproverRole;
import com.ngo.finance.donor.enums.CriterionType;
import com.ngo.finance.donor.enums.DisbursementType;
import com.ngo.finance.donor.enums.ReportingFrequency;
import com.ngo.finance.donor.enums.RestrictionRuleType;
import com.ngo.finance.donor.enums.ScheduleFrequency;
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
    private ReportingFrequency reportingFrequency;
    private Boolean movementAllowed;
    private Boolean explanationRequired;
    private Boolean onboardingComplete;
    private List<SpendableLocationItem> spendableLocations;
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
    public static class SpendableLocationItem {
        private Long id;
        private Long stateId;
        private String stateName;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class UtilisationRuleItem {
        private Long id;
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
        private Long id;
        private String totalAmountCommitted;
        private DisbursementType disbursementType;
        private List<TrancheDetailItem> trancheDetail;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class TrancheDetailItem {
        private Long id;
        private String amount;
        private ScheduleFrequency frequency;
        private Boolean isFinalTranche;
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
        private Boolean escalateToDeputy;
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
