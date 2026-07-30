package com.ngo.finance.donor.entity;

import com.ngo.finance.common.entity.AuditEntity;
import com.ngo.finance.donor.enums.DisbursementType;
import jakarta.persistence.CascadeType;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.ForeignKey;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.OneToMany;
import jakarta.persistence.Table;
import java.math.BigDecimal;
import java.util.ArrayList;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;
import lombok.ToString;
import java.util.List;

/**
 * How money is released for a fund profile (workbook sheet 06) — tranche-on-UC
 * /
 * on-report / lump-sum / hold, with an optional prior-utilisation gate.
 */
@Entity
@Table(name = "donor_disbursement_rule")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@EqualsAndHashCode(exclude = { "fundProfile" }, callSuper = true)
@ToString(exclude = { "fundProfile" })
public class DonorDisbursementRule extends AuditEntity {

    @ManyToOne
    @JoinColumn(name = "fund_profile_id", nullable = false, foreignKey = @ForeignKey(name = "fk_disb_profile"))
    private DonorFundProfile fundProfile;

    @Column(name = "total_amount", precision = 19, scale = 2)
    private BigDecimal totalAmount;

    @Column(name = "disbursement_type", nullable = false, length = 50)
    @Enumerated(EnumType.STRING)
    private DisbursementType disbursementType;

    @OneToMany(mappedBy = "donorDisbursementRule", cascade = CascadeType.ALL, orphanRemoval = true)
    @Builder.Default
    private List<DonorTrancheCriterion> donorTrancheCriteria = new ArrayList();

}
