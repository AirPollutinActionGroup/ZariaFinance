package com.ngo.finance.donor.dto.request;

import com.ngo.finance.donor.enums.CriterionType;
import com.ngo.finance.donor.enums.DisbursementType;
import com.ngo.finance.donor.enums.RepeatReminder;
import com.ngo.finance.donor.enums.ResponsibleRole;
import com.ngo.finance.donor.enums.ScheduleType;
import com.ngo.finance.donor.enums.TriggerBasis;
import com.ngo.finance.donor.enums.VerificationRole;
import com.ngo.finance.donor.validator.annotation.ValidDisbursementSchedule;
import jakarta.validation.Valid;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
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
 * The whole disbursement configuration for one grant, saved in a single PUT:
 * schedule, tranches, each tranche's criteria, and each criterion's reminder.
 *
 * The committed total is not accepted — it is the grant's total grant amount.
 * Tranche ids identify existing rows so receipts survive an edit; a tranche
 * without an id is new.
 *
 * Shape rules (lump sum vs tranches, mandatory fields per criterion type,
 * reminders only on human-actioned criteria) live in
 * {@link com.ngo.finance.donor.validator.DisbursementScheduleValidator} so they
 * come back as field errors rather than 500s.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@ValidDisbursementSchedule
public class DisbursementScheduleRequest {

    @NotNull(message = "Disbursement type is required")
    private DisbursementType disbursementType;

    /** Lump sum only. */
    private LocalDate receivingDate;

    /** Tranches only. */
    private ScheduleType scheduleType;

    @Valid
    @Builder.Default
    private List<TrancheItem> tranches = new ArrayList<>();

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class TrancheItem {

        /** Null for a new tranche; set to update an existing one in place. */
        private Long id;

        private String trancheName;

        @NotNull(message = "Tranche amount is required")
        @Positive(message = "Tranche amount must be positive")
        private BigDecimal amount;

        /**
         * When the next release is expected. Optional: the spec allows the final
         * tranche to leave this blank / not applicable.
         */
        private LocalDate expectedReleaseDate;

        @Valid
        @Builder.Default
        private List<CriterionItem> criteria = new ArrayList<>();
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class CriterionItem {

        /** Null for a new criterion; set to keep an existing one's met state. */
        private Long id;

        @NotNull(message = "Criterion type is required")
        private CriterionType criterionType;

        private LocalDate releaseDate;

        private String milestoneName;

        private VerificationRole verificationRole;

        private LocalDate targetDate;

        @Min(value = 1, message = "Utilisation % must be between 1 and 100")
        @Max(value = 100, message = "Utilisation % must be between 1 and 100")
        private BigDecimal utilisationPercent;

        private TriggerBasis triggerBasis;

        private String description;

        /** Only allowed on human-actioned types; see CriterionType. */
        @Valid
        private ReminderItem reminder;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ReminderItem {

        @NotNull(message = "Responsible role is required")
        private ResponsibleRole responsibleRole;

        @NotNull(message = "Reminder lead time is required")
        @Min(value = 0, message = "Reminder lead time cannot be negative")
        @Max(value = 365, message = "Reminder lead time cannot exceed 365 days")
        private Integer reminderLeadDays;

        @Builder.Default
        private RepeatReminder repeatReminder = RepeatReminder.ONCE;

        @Builder.Default
        private Boolean escalateToDeputy = true;
    }
}
