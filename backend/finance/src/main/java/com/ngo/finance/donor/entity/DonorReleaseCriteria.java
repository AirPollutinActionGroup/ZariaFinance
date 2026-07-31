package com.ngo.finance.donor.entity;

import java.time.LocalDate;

import com.ngo.finance.common.entity.AuditEntity;
import com.ngo.finance.donor.enums.CriterionType;
import com.ngo.finance.donor.enums.RepeatReminder;
import com.ngo.finance.donor.enums.TriggerBasis;
import com.ngo.finance.donor.enums.VerificationRole;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.ForeignKey;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import jakarta.persistence.Table;

@Entity
@Table(name = "donor_release_criteria")
@Getter
@Setter
@NoArgsConstructor
public class DonorReleaseCriteria extends AuditEntity {

    @ManyToOne
    @JoinColumn(name = "tranche_criterion_id", nullable = false, foreignKey = @ForeignKey(name = "fk_release_criteria_tranche_criterion"))
    private DonorTrancheCriterion donorTrancheCriterion;

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
