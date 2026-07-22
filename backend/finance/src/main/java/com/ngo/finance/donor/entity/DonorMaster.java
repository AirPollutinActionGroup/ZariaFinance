package com.ngo.finance.donor.entity;

import com.ngo.finance.common.entity.AuditEntity;
import com.ngo.finance.donor.enums.DonorType;
import com.ngo.finance.donor.enums.FundSourceDomicile;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.ForeignKey;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Donor Master entity - represents a donor organization
 */
@Entity
@Table(name = "donor_master")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
// @EqualsAndHashCode(exclude = { "contacts", "grants", "mapping" }, callSuper =
// true)
// @ToString(exclude = { "contacts", "grants", "mapping" })
public class DonorMaster extends AuditEntity {

    @Column(nullable = false, unique = true, length = 20)
    private String donorCode;

    @Column(nullable = false, length = 255)
    private String donorName;

    @Column(nullable = false, length = 50)
    @Enumerated(EnumType.STRING)
    private DonorType donorType;

    @Column(name = "fund_source_domicile", length = 20)
    @Enumerated(EnumType.STRING)
    private FundSourceDomicile fundSourceDomicile; // 'Domestic' | 'Foreign'

    @Column(name = "fcra_applicable")
    @Builder.Default
    private Boolean fcraApplicable = false;

    @Column(name = "foreign_fund_source_type", length = 50)
    private String foreignFundSourceType;

    @Column(name = "foreign_country_id", length = 100)
    private String foreignCountryId;

    @Column(name = "pan_card_number", length = 20)
    private String panCardNumber;

    @Column(length = 100)
    private String foreignTaxIdentifier;

    @Column(nullable = false, length = 255)
    private String email;

    @Column(length = 20)
    private String phoneNumber;

    @Column(length = 255)
    private String website;

    @Column(nullable = false, length = 255)
    private String spocNameOfThePerson;

    @Column(nullable = true, length = 255)
    private String spocPhoneNumber;

    @Column(nullable = false, length = 255)
    private String spocEmail;

    @Column(columnDefinition = "TEXT")
    private String address;

    @Column(name = "address2", nullable = true, columnDefinition = "TEXT")
    private String address2;

    @ManyToOne
    @JoinColumn(name = "city_id", foreignKey = @ForeignKey(name = "fk_donor_city"))
    private CityMaster city;

    @ManyToOne
    @JoinColumn(name = "state_id", foreignKey = @ForeignKey(name = "fk_donor_state"))
    private StateMaster state;

    @ManyToOne
    @JoinColumn(name = "country_id", foreignKey = @ForeignKey(name = "fk_donor_country"))
    private CountryMaster country;

    @Column(length = 20)
    private String postalCode;

    @Column(length = 100)
    private String registrationNumber; // Registration/Incorporation Number – The donor's registration or incorporation
                                       // number in its home country. This field is applicable only for organisations
                                       // (e.g., companies or foundations) and not for individual donors.

    @Column(nullable = false)
    @Builder.Default
    private Boolean isActive = true;

}
