package com.ngo.finance.donor.entity;

import com.ngo.finance.common.entity.AuditEntity;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.ForeignKey;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;
import lombok.ToString;

/**
 * A geography a fund profile may be spent in (workbook sheet 04). One-to-many on
 * the fund profile; free-form region name (e.g. "Delhi NCR", "Pan-India (untied)").
 */
@Entity
@Table(name = "donor_geography")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@EqualsAndHashCode(exclude = {"fundProfile"}, callSuper = true)
@ToString(exclude = {"fundProfile"})
public class DonorGeography extends AuditEntity {

    @ManyToOne
    @JoinColumn(name = "fund_profile_id", nullable = false, foreignKey = @ForeignKey(name = "fk_geo_profile"))
    private DonorFundProfile fundProfile;

    @Column(name = "geography_name", nullable = false, length = 255)
    private String geographyName;
}
