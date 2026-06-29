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
 * Donor Contact entity - represents contact persons for a donor
 */
@Entity
@Table(name = "donor_contact")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@EqualsAndHashCode(exclude = {"donor", "city", "state"}, callSuper = true)
@ToString(exclude = {"donor", "city", "state"})
public class DonorContact extends AuditEntity {

    @ManyToOne
    @JoinColumn(name = "donor_id", nullable = false, foreignKey = @ForeignKey(name = "fk_contact_donor"))
    private DonorMaster donor;

    @Column(nullable = false, length = 255)
    private String contactName;

    @Column(length = 100)
    private String contactTitle;

    @Column(length = 255)
    private String email;

    @Column(length = 20)
    private String phoneNumber;

    @Column(length = 20)
    private String mobileNumber;

    @Column(columnDefinition = "TEXT")
    private String address;

    @ManyToOne
    @JoinColumn(name = "city_id", foreignKey = @ForeignKey(name = "fk_contact_city"))
    private CityMaster city;

    @ManyToOne
    @JoinColumn(name = "state_id", foreignKey = @ForeignKey(name = "fk_contact_state"))
    private StateMaster state;

    @Column(length = 20)
    private String postalCode;

    @Column(length = 50)
    private String contactType;

    @Column(nullable = false)
    @Builder.Default
    private Boolean isPrimary = false;
}
