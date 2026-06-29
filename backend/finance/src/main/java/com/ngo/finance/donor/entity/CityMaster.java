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
 * City Master entity
 */
@Entity
@Table(name = "city_master")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@EqualsAndHashCode(exclude = "district", callSuper = true)
@ToString(exclude = "district")
public class CityMaster extends AuditEntity {

    @Column(nullable = false, length = 10)
    private String cityCode;

    @Column(nullable = false, length = 255)
    private String cityName;

    @Column(nullable = false)
    @Builder.Default
    private Boolean isActive = true;

    @ManyToOne
    @JoinColumn(name = "district_id", nullable = false, foreignKey = @ForeignKey(name = "fk_city_district"))
    private DistrictMaster district;
}
