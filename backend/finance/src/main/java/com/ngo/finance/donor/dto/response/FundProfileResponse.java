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
    private String fundClass;
    private String fundClassLabel;
    private String purpose;
    private Boolean programmeTied;
    private Long programmeId;
    private String programmeName;
    private String reportingFrequency;
    private String reportingFrequencyLabel;
    private Boolean movementAllowed;
    private Boolean explanationRequired;
    private Boolean onboardingComplete;
    private List<SpendableLocationItem> spendableLocations;
    private List<UtilisationRuleItem> utilisationRules;
    private List<DisbursementRuleItem> disbursementRules;
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
        private String stateCode;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class UtilisationRuleItem {
        private Long id;
        private String ruleType;
        private String ruleTypeLabel;
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
        private String disbursementType;
        private String disbursementTypeLabel;
        private List<TrancheCriterionItem> trancheCriteria;
        /** Sigma of trancheCriteria.amountCriteria. */
        private BigDecimal allocatedAmount;
        /** totalAmount minus allocatedAmount. */
        private BigDecimal unallocatedAmount;
        private Boolean balanced;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class TrancheCriterionItem {
        private Long id;
        private BigDecimal amountCriteria;
        private LocalDate expectedReleaseDate;
        private String frequency;
        private String frequencyLabel;
        private Boolean isFinalTranche;
        private String releaseCriteria;
        private String releaseCriteriaLabel;
        private LocalDate releaseDate;
        private String milestoneName;
        private String verificationSignOffRole;
        private String verificationSignOffRoleLabel;
        private String otherVerificationSignOffRole;
        private LocalDate targetDate;
        private Double utilisationPercentage;
        private String triggerBasis;
        private String triggerBasisLabel;
        private String description;
        private Boolean remindSomeone;
        private String responsibleRole;
        private String responsibleRoleLabel;
        private String otherResponsibleRole;
        private Integer reminderLeadTime;
        private String repeatReminder;
        private String repeatReminderLabel;
        private Boolean escalateToDeputy;
    }
}
