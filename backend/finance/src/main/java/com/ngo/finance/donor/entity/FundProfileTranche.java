package com.ngo.finance.donor.entity;

import com.ngo.finance.common.entity.AuditEntity;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.ForeignKey;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import java.math.BigDecimal;
import java.time.LocalDate;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;
import lombok.ToString;

/**
 * A planned release in a fund profile's tranche schedule. The sum of a profile's
 * tranche amounts is the Total Grant Amount inherited by every grant on that
 * profile (New Grant Agreement Form, section 2).
 *
 * Distinct from {@link GrantTranche}, which tracks the actual per-grant release
 * and utilisation lifecycle.
 */
@Entity
@Table(name = "fund_profile_tranche")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@EqualsAndHashCode(exclude = {"fundProfile"}, callSuper = true)
@ToString(exclude = {"fundProfile"})
public class FundProfileTranche extends AuditEntity {

    @ManyToOne
    @JoinColumn(name = "fund_profile_id", nullable = false,
            foreignKey = @ForeignKey(name = "fk_profile_tranche_profile"))
    private DonorFundProfile fundProfile;

    @Column(name = "tranche_number", nullable = false)
    private Integer trancheNumber;

    @Column(name = "tranche_name", length = 255)
    private String trancheName;

    @Column(name = "tranche_amount", nullable = false, precision = 15, scale = 2)
    private BigDecimal trancheAmount;

    @Column(name = "planned_release_date")
    private LocalDate plannedReleaseDate;
}
