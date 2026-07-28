package com.ngo.finance.donor.entity;

import com.ngo.finance.common.entity.AuditEntity;
import com.ngo.finance.donor.enums.CriterionType;
import com.ngo.finance.donor.enums.ScheduleFrequency;

import java.time.LocalDate;
import jakarta.persistence.Column;
import jakarta.persistence.ForeignKey;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;
import lombok.ToString;
import com.ngo.finance.donor.enums.ApproverRole;

@Entity
@Table(name = "donor_tranche_detail")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@EqualsAndHashCode(exclude = { "disbursementRule" }, callSuper = true)
@ToString(exclude = { "disbursementRule" })
public class DonorTrancheDetail extends AuditEntity {

    @ManyToOne
    @JoinColumn(name = "disbursement_rule_id", nullable = false, foreignKey = @ForeignKey(name = "fk_tranche_detail_disbursement_rule"))
    private DonorDisbursementRule disbursementRule;

    @Column(name = "amount", nullable = false)
    private String amount;

    @Column(name = "frequency", nullable = false)
    @Enumerated(EnumType.STRING)
    private ScheduleFrequency frequency;

    @Column(name = "is_final_tranche", nullable = false)
    @Builder.Default
    private Boolean isFinalTranche = false;

    @Column(name = "release_criteria", nullable = false)
    @Enumerated(EnumType.STRING)
    private CriterionType releaseCriteria;

    // Everything below is conditional on releaseCriteria / whether a reminder is
    // configured.
    @Column(name = "release_date")
    private LocalDate releaseDate;

    @Column(name = "milestone_name")
    private String milestoneName;

    @Column(name = "sign_of_role")
    @Enumerated(EnumType.STRING)
    private ApproverRole signOfRole;

    @Column(name = "other_sign_of_role")
    private String otherSignOfRole;

    @Column(name = "target_date")
    private LocalDate targetDate;

    @Column(name = "utilisation_percentage")
    private String utilisationPercentage;

    @Column(name = "trigger_base")
    private String triggerBase;

    @Column(name = "description")
    private String description;

    @Column(name = "responsible_role")
    @Enumerated(EnumType.STRING)
    private ApproverRole responsibleRole;

    @Column(name = "other_responsible_role")
    private String otherResponsibleRole;

    @Column(name = "reminder_lead_time")
    private String reminderLeadTime;

    @Column(name = "repeat_reminder")
    private String repeatReminder;

    @Column(name = "escalate_to_deputy")
    @Builder.Default
    private Boolean escalateToDeputy = false;

}
