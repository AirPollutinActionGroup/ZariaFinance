package com.ngo.finance.donor.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.math.BigDecimal;
import java.time.LocalDate;

import com.ngo.finance.common.entity.AuditEntity;
import com.ngo.finance.donor.enums.CriterionType;
import com.ngo.finance.donor.enums.RepeatReminder;
import com.ngo.finance.donor.enums.ScheduleType;
import com.ngo.finance.donor.enums.TriggerBasis;
import com.ngo.finance.donor.enums.VerificationRole;

/**
 * A single release criterion that gates a {@link GrantTranche}'s payment.
 *
 * The criterion type is the router: fields shown depend on it (e.g. Milestone
 * Based
 * reveals milestone name + sign-off role). The reminder/escalation block exists
 * only
 * when "Remind someone about this" is toggled on, so it is modelled as a
 * nullable
 * {@code @Embedded} value object.
 *
 * Reuses existing enums {@link CriterionType} and {@link ApproverRole} — do not
 * redefine them here.
 */
@Entity
@Table(name = "donor_tranche_criterion")
@Getter
@Setter
@NoArgsConstructor
public class DonorTrancheCriterion extends AuditEntity {

    @ManyToOne
    @JoinColumn(name = "disbursement_rule_id", nullable = false, foreignKey = @ForeignKey(name = "fk_criterion_disb_rule"))
    private DonorDisbursementRule donorDisbursementRule;

    @Column(name = "amount_criteria", nullable = false, precision = 19, scale = 2)
    private BigDecimal amountCriteria;

    @Column(name = "expected_release_date")
    private LocalDate expectedReleaseDate;

    @Column(name = "frequency", length = 50)
    @Enumerated(EnumType.STRING)
    private ScheduleType frequency = ScheduleType.MONTHLY;

    @Column(name = "is_final_tranche")
    private Boolean isFinalTranche = false;

    @Column(name = "release_criteria", columnDefinition = "TEXT")
    @Enumerated(EnumType.STRING)
    private CriterionType releaseCriteria;

    @Column(name = "release_date")
    private LocalDate releaseDate;

    @Column(name = "utilisation_percentage")
    private Double utilisationPercentage;

    @Column(name = "trigger_basis", length = 50)
    @Enumerated(EnumType.STRING)
    private TriggerBasis triggerBasis;

    @Column(name = "description", columnDefinition = "TEXT")
    private String description;

    @Column(name = "milestone_name", length = 100)
    private String milestoneName;

    @Column(name = "verification_sign_off_role", length = 50)
    @Enumerated(EnumType.STRING)
    private VerificationRole verificationSignOffRole;

    @Column(name = "other_verification_sign_off_role", length = 100)
    private String otherVerificationSignOffRole;

    @Column(name = "trigger_date")
    private LocalDate targetDate;

    @Column(name = "remind_someone")
    private Boolean remindSomeone = false;
    @Column(name = "responsible_role", length = 50)
    @Enumerated(EnumType.STRING)
    private VerificationRole responsibleRole;
    @Column(name = "other_responsible_role", length = 100)
    private String otherResponsibleRole;
    @Column(name = "reminder_lead_time")
    private Integer reminderLeadTime;
    @Column(name = "repeat_reminder", length = 50)
    @Enumerated(EnumType.STRING)
    private RepeatReminder repeatReminder;
    @Column(name = "escalate_to_deputy")
    private Boolean escalateToDeputy = false;

}
