package com.ngo.finance.donor.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.math.BigDecimal;
import java.time.LocalDate;

import com.ngo.finance.common.entity.AuditEntity;
import com.ngo.finance.donor.enums.ScheduleType;
import java.util.ArrayList;
import java.util.List;

/**
 * A planned tranche of a {@link DonorDisbursementRule} — amount, expected
 * release date and cadence. The condition(s) that gate its payment live on
 * {@link DonorReleaseCriteria}, one-to-many, since a tranche may need more
 * than one release criterion satisfied.
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

    @OneToMany(mappedBy = "donorTrancheCriterion", cascade = CascadeType.ALL, orphanRemoval = true)
    @OrderBy("id ASC")
    private List<DonorReleaseCriteria> donorReleaseCriteria = new ArrayList();

}
