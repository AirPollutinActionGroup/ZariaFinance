package com.ngo.finance.donor.entity;

import com.ngo.finance.common.entity.AuditEntity;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.ForeignKey;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import java.math.BigDecimal;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;
import lombok.ToString;

/**
 * How money is released for a fund profile (workbook sheet 06) — tranche-on-UC /
 * on-report / lump-sum / hold, with an optional prior-utilisation gate.
 */
@Entity
@Table(name = "donor_disbursement_rule")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@EqualsAndHashCode(exclude = {"fundProfile"}, callSuper = true)
@ToString(exclude = {"fundProfile"})
public class DonorDisbursementRule extends AuditEntity {

    @ManyToOne
    @JoinColumn(name = "fund_profile_id", nullable = false, foreignKey = @ForeignKey(name = "fk_disb_profile"))
    private DonorFundProfile fundProfile;

    @Column(name = "rule_type", nullable = false, length = 50)
    private String ruleType;

    @Column(name = "release_trigger", length = 60)
    private String releaseTrigger;

    @Column(name = "min_prior_utilisation_required", precision = 5, scale = 2)
    private BigDecimal minPriorUtilisationRequired;

    @Column(name = "milestone_required")
    @Builder.Default
    private Boolean milestoneRequired = false;

    @Column(name = "rule_description", columnDefinition = "TEXT")
    private String ruleDescription;
}
