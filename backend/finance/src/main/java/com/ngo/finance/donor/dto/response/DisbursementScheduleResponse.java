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
 * A grant's disbursement configuration, with the derived figures the form and
 * the summary cards need: the committed total (from the grant), what the tranche
 * plan currently allocates, and the shortfall between them.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@JsonInclude(JsonInclude.Include.NON_NULL)
public class DisbursementScheduleResponse {

    private Long id;

    private Long grantId;

    private String grantCode;

    private String disbursementType;

    private LocalDate receivingDate;

    private String scheduleType;

    /** Human label for the cadence, echoed by each tranche as its frequency. */
    private String frequencyLabel;

    private Boolean finalised;

    private LocalDateTime finalisedAt;

    /** The grant's total grant amount — what the tranches must add up to. */
    private BigDecimal totalAmountCommitted;

    /** Σ of the tranche amounts as currently configured. */
    private BigDecimal allocatedAmount;

    /** committed − allocated; zero means the plan balances and can be finalised. */
    private BigDecimal unallocatedAmount;

    private Boolean balanced;

    private List<TrancheItem> tranches;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    @JsonInclude(JsonInclude.Include.NON_NULL)
    public static class TrancheItem {
        private Long id;
        private Integer trancheNumber;
        private String trancheName;
        private BigDecimal amount;
        private LocalDate expectedReleaseDate;
        private String frequencyLabel;
        /** True for the last tranche, where an expected date is optional. */
        private Boolean finalTranche;
        private String trancheStatus;
        private BigDecimal actualAmount;
        private LocalDate actualReleaseDate;
        /** Receipts are protected: a received tranche cannot be removed or re-priced. */
        private Boolean received;
        private Boolean criteriaSatisfied;
        private Long criteriaMetCount;
        private List<CriterionItem> criteria;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    @JsonInclude(JsonInclude.Include.NON_NULL)
    public static class CriterionItem {
        private Long id;
        private Integer sequence;
        private String criterionType;
        private String criterionTypeLabel;
        private LocalDate releaseDate;
        private String milestoneName;
        private String verificationRole;
        private String verificationRoleLabel;
        private LocalDate targetDate;
        private BigDecimal utilisationPercent;
        private String triggerBasis;
        private String triggerBasisLabel;
        private String description;
        private Boolean met;
        private LocalDateTime metAt;
        /** Whether a reminder may be configured for this type. */
        private Boolean humanActioned;
        private ReminderItem reminder;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    @JsonInclude(JsonInclude.Include.NON_NULL)
    public static class ReminderItem {
        private Long id;
        private String responsibleRole;
        private String responsibleRoleLabel;
        private Integer reminderLeadDays;
        private String repeatReminder;
        private Boolean escalateToDeputy;
        /** Expected release date − lead days; computed, never stored. */
        private LocalDate dueDate;
        /** Resolved through the role directory; null when the role has no holder. */
        private String responsiblePersonName;
        private String deputyName;
    }
}
