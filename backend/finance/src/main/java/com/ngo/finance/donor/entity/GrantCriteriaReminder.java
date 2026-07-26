package com.ngo.finance.donor.entity;

import com.ngo.finance.common.entity.AuditEntity;
import com.ngo.finance.donor.enums.RepeatReminder;
import com.ngo.finance.donor.enums.ResponsibleRole;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.ForeignKey;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.OneToOne;
import jakarta.persistence.Table;
import java.time.LocalDate;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;
import lombok.ToString;

/**
 * Reminder & escalation for one human-actioned criterion (Disbursement Rules §5).
 *
 * The due date is derived, never stored — see {@link #dueDate(LocalDate)} — so a
 * tranche date change can't leave a stale countdown behind.
 */
@Entity
@Table(name = "grant_criteria_reminder")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@EqualsAndHashCode(exclude = "criterion", callSuper = true)
@ToString(exclude = "criterion")
public class GrantCriteriaReminder extends AuditEntity {

    @OneToOne
    @JoinColumn(name = "criterion_id", nullable = false, unique = true,
            foreignKey = @ForeignKey(name = "fk_reminder_criterion"))
    private GrantTrancheCriterion criterion;

    @Column(name = "responsible_role", nullable = false, length = 30)
    @Enumerated(EnumType.STRING)
    private ResponsibleRole responsibleRole;

    /** Days before the tranche's expected release date to start reminding. */
    @Column(name = "reminder_lead_days", nullable = false)
    private Integer reminderLeadDays;

    @Column(name = "repeat_reminder", nullable = false, length = 20)
    @Enumerated(EnumType.STRING)
    @Builder.Default
    private RepeatReminder repeatReminder = RepeatReminder.ONCE;

    /** Copies the deputy in. Notification only — approval authority stays put. */
    @Column(name = "escalate_to_deputy", nullable = false)
    @Builder.Default
    private Boolean escalateToDeputy = true;

    /**
     * When reminding should start: the tranche's expected release date minus the
     * lead time. Null when the tranche has no expected date (e.g. a final tranche
     * marked not-applicable) — nothing to count down to.
     */
    public LocalDate dueDate(LocalDate expectedReleaseDate) {
        if (expectedReleaseDate == null || reminderLeadDays == null) {
            return null;
        }
        return expectedReleaseDate.minusDays(reminderLeadDays);
    }
}
