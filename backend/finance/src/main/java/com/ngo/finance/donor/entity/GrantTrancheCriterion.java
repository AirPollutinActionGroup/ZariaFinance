package com.ngo.finance.donor.entity;

import com.ngo.finance.common.entity.AuditEntity;
import com.ngo.finance.donor.enums.CriterionType;
import com.ngo.finance.donor.enums.TriggerBasis;
import com.ngo.finance.donor.enums.VerificationRole;
import jakarta.persistence.CascadeType;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.ForeignKey;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.OneToOne;
import jakarta.persistence.Table;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;
import lombok.ToString;

/**
 * One release condition on a tranche (Disbursement Rules §4). Fields are sparse
 * by design — only those belonging to {@code criterionType} are populated, and
 * the DB enforces the mandatory ones per type.
 */
@Entity
@Table(name = "grant_tranche_criteria")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@EqualsAndHashCode(exclude = {"tranche", "reminder"}, callSuper = true)
@ToString(exclude = {"tranche", "reminder"})
public class GrantTrancheCriterion extends AuditEntity {

    @ManyToOne
    @JoinColumn(name = "tranche_id", nullable = false, foreignKey = @ForeignKey(name = "fk_criteria_tranche"))
    private GrantTranche tranche;

    /** Position within the tranche's criteria list; renumbered 1..n on save. */
    @Column(nullable = false)
    private Integer sequence;

    @Column(name = "criterion_type", nullable = false, length = 30)
    @Enumerated(EnumType.STRING)
    private CriterionType criterionType;

    /** FIXED_DATE. */
    @Column(name = "release_date")
    private LocalDate releaseDate;

    /** MILESTONE_BASED. */
    @Column(name = "milestone_name", length = 255)
    private String milestoneName;

    @Column(name = "verification_role", length = 30)
    @Enumerated(EnumType.STRING)
    private VerificationRole verificationRole;

    /** MILESTONE_BASED, optional — some milestones are event-driven, not dated. */
    @Column(name = "target_date")
    private LocalDate targetDate;

    /** UTILISATION_THRESHOLD. */
    @Column(name = "utilisation_percent", precision = 5, scale = 2)
    private BigDecimal utilisationPercent;

    @Column(name = "trigger_basis", length = 20)
    @Enumerated(EnumType.STRING)
    private TriggerBasis triggerBasis;

    /** Optional for UTILISATION_THRESHOLD, mandatory for OTHER. */
    @Column(columnDefinition = "TEXT")
    private String description;

    /** The tranche's release gate is open when every criterion is met. */
    @Column(nullable = false)
    @Builder.Default
    private Boolean met = false;

    @Column(name = "met_at")
    private LocalDateTime metAt;

    @Column(name = "met_by")
    private Long metBy;

    /** Present only for human-actioned types; see {@link CriterionType}. */
    @OneToOne(mappedBy = "criterion", cascade = CascadeType.ALL, orphanRemoval = true)
    private GrantCriteriaReminder reminder;
}
