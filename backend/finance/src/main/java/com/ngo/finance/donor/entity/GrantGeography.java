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
 * Grant Geography entity - owned by GrantAgreement
 */
@Entity
@Table(name = "grant_geography")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@EqualsAndHashCode(exclude = {"grant", "state", "district", "city"}, callSuper = true)
@ToString(exclude = {"grant", "state", "district", "city"})
public class GrantGeography extends AuditEntity {

    @ManyToOne
    @JoinColumn(name = "grant_id", nullable = false, foreignKey = @ForeignKey(name = "fk_geography_grant"))
    private GrantAgreement grant;

    @ManyToOne
    @JoinColumn(name = "state_id", foreignKey = @ForeignKey(name = "fk_geography_state"))
    private StateMaster state;

    @ManyToOne
    @JoinColumn(name = "district_id", foreignKey = @ForeignKey(name = "fk_geography_district"))
    private DistrictMaster district;

    @ManyToOne
    @JoinColumn(name = "city_id", foreignKey = @ForeignKey(name = "fk_geography_city"))
    private CityMaster city;

    @Column(precision = 5, scale = 2)
    private BigDecimal coverageAreaPercentage;

    @Column
    private Integer priorityLevel;
}
