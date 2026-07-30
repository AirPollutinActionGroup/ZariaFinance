package com.ngo.finance.donor.entity;

import com.ngo.finance.common.entity.AuditEntity;
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

@Entity
@Table(name = "spendable_geography")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@EqualsAndHashCode(exclude = { "fundProfile" }, callSuper = true)
@ToString(exclude = { "fundProfile" })
public class SpendableGeography extends AuditEntity {

    @ManyToOne
    @JoinColumn(name = "fund_profile_id", nullable = false, foreignKey = @ForeignKey(name = "fk_geo_profile"))
    private DonorFundProfile fundProfile;

    @ManyToOne
    @JoinColumn(name = "state_id", nullable = false, foreignKey = @ForeignKey(name = "fk_donation_location_state"))
    private StateMaster state;

}
