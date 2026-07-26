package com.ngo.finance.donation.entity;

import com.ngo.finance.common.entity.AuditEntity;
import com.ngo.finance.donor.entity.StateMaster;
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
 * One state a donation's use is tied to. A single gift may fund work across
 * several states; feeds FCRA state-wise disclosure. Mirrors GrantGeography.
 */
@Entity
@Table(name = "donation_location")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@EqualsAndHashCode(exclude = {"donation", "state"}, callSuper = true)
@ToString(exclude = {"donation", "state"})
public class DonationLocation extends AuditEntity {

    @ManyToOne
    @JoinColumn(name = "donation_id", nullable = false, foreignKey = @ForeignKey(name = "fk_donation_location_donation"))
    private Donation donation;

    @ManyToOne
    @JoinColumn(name = "state_id", nullable = false, foreignKey = @ForeignKey(name = "fk_donation_location_state"))
    private StateMaster state;
}
