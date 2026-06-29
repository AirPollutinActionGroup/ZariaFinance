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
import java.util.ArrayList;
import java.util.List;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;
import lombok.ToString;

/**
 * District Master entity
 */
@Entity
@Table(name = "district_master")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@EqualsAndHashCode(exclude = {"state", "cities"}, callSuper = true)
@ToString(exclude = {"state", "cities"})
public class DistrictMaster extends AuditEntity {

    @Column(nullable = false, length = 10)
    private String districtCode;

    @Column(nullable = false, length = 255)
    private String districtName;

    @Column(nullable = false)
    @Builder.Default
    private Boolean isActive = true;

    @ManyToOne
    @JoinColumn(name = "state_id", nullable = false, foreignKey = @ForeignKey(name = "fk_district_state"))
    private StateMaster state;

    @OneToMany(mappedBy = "district", cascade = CascadeType.ALL, orphanRemoval = true)
    @Builder.Default
    private List<CityMaster> cities = new ArrayList<>();
}
