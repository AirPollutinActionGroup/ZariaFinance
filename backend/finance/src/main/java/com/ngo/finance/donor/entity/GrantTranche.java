package com.ngo.finance.donor.entity;

import com.ngo.finance.common.entity.AuditEntity;
import jakarta.persistence.CascadeType;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.ForeignKey;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.OneToMany;
import jakarta.persistence.Table;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;
import lombok.ToString;

/**
 * Grant Tranche entity - owned by GrantAgreement
 */
@Entity
@Table(name = "grant_tranche")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@EqualsAndHashCode(exclude = {"grant", "criteria"}, callSuper = true)
@ToString(exclude = {"grant", "criteria"})
public class GrantTranche extends AuditEntity {

    @ManyToOne
    @JoinColumn(name = "grant_id", nullable = false, foreignKey = @ForeignKey(name = "fk_tranche_grant"))
    private GrantAgreement grant;

    @Column(nullable = false)
    private Integer trancheNumber;

    @Column(length = 255)
    private String trancheName;

    @Column(nullable = false, precision = 15, scale = 2)
    private BigDecimal trancheAmount;

    @Column
    private LocalDate plannedReleaseDate;

    @Column
    private LocalDate actualReleaseDate;

    // Superseded by the structured `criteria` list below (V45 back-filled these
    // into OTHER criteria). Retained for historical rows; no longer written.
    @Column(columnDefinition = "TEXT")
    private String conditionsToRelease;

    @Column(length = 50, nullable = false)
    @Builder.Default
    private String trancheStatus = "PENDING";

    // Workbook sheet 08 fields (added in V16): the amount actually received (may
    // differ from the expected trancheAmount), the prior-utilisation gate %, and
    // whether the release condition has been met.
    @Column(name = "actual_amount", precision = 18, scale = 2)
    private BigDecimal actualAmount;

    @Column(name = "prior_utilisation_required", precision = 5, scale = 2)
    private BigDecimal priorUtilisationRequired;

    @Column(name = "condition_met", length = 20)
    private String conditionMet;

    // Tranche-on-UC funding cycle (V23, issue #21 item 13): the amount utilised up
    // to the end of this tranche's period, and that period-end date. Together with
    // actualAmount (received) these drive the per-tranche Utilisation Certificate.
    @Column(name = "utilised_amount", precision = 18, scale = 2)
    private BigDecimal utilisedAmount;

    @Column(name = "utilisation_end_date")
    private LocalDate utilisationEndDate;

    // Structured release conditions (Disbursement Rules §4). A tranche's gate is
    // open only when every criterion is met.
    @OneToMany(mappedBy = "tranche", cascade = CascadeType.ALL, orphanRemoval = true)
    @Builder.Default
    private List<GrantTrancheCriterion> criteria = new ArrayList<>();

    /** True when the release gate is satisfied. No criteria means nothing to gate on. */
    public boolean criteriaSatisfied() {
        return criteria.stream().allMatch(c -> Boolean.TRUE.equals(c.getMet()));
    }

    public long criteriaMetCount() {
        return criteria.stream().filter(c -> Boolean.TRUE.equals(c.getMet())).count();
    }

    /** True once the money has actually arrived — receipts must never be lost. */
    public boolean isReceived() {
        return actualAmount != null;
    }
}
