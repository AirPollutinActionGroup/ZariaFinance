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
@Table(name = "spendable_location")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@EqualsAndHashCode(exclude = { "donorFundProfile", "state" }, callSuper = true)
@ToString(exclude = { "donorFundProfile", "state" })
public class SpendableLocation extends AuditEntity {

    @ManyToOne
    @JoinColumn(name = "donor_fund_profile_id", nullable = false, foreignKey = @ForeignKey(name = "fk_spendable_location_donor_fund_profile"))
    private DonorFundProfile donorFundProfile;

    @ManyToOne
    @JoinColumn(name = "state_id", nullable = false, foreignKey = @ForeignKey(name = "fk_spendable_location_state"))
    private StateMaster state;

}
