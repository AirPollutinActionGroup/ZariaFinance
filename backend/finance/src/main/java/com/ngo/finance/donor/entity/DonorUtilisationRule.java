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
 * Quantitative utilisation cap on a fund profile (workbook sheet 05) — e.g.
 * "Admin / Overhead cap" 5%, "Fundraising cost exclusion" 0%.
 */
@Entity
@Table(name = "donor_utilisation_rule")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@EqualsAndHashCode(exclude = {"fundProfile"}, callSuper = true)
@ToString(exclude = {"fundProfile"})
public class DonorUtilisationRule extends AuditEntity {

    @ManyToOne
    @JoinColumn(name = "fund_profile_id", nullable = false, foreignKey = @ForeignKey(name = "fk_util_profile"))
    private DonorFundProfile fundProfile;

    @Column(name = "rule_type", nullable = false, length = 50)
    private String ruleType;

    @Column(name = "limit_percentage", precision = 5, scale = 2)
    private BigDecimal limitPercentage;

    @Column(columnDefinition = "TEXT")
    private String description;
}
