package com.ngo.finance.donor.entity;

import com.ngo.finance.common.entity.AuditEntity;
import com.ngo.finance.donor.enums.DonorStatus;
import com.ngo.finance.donor.enums.FundClass;
import jakarta.persistence.CascadeType;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.ForeignKey;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.OneToMany;
import jakarta.persistence.OneToOne;
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
 * Donor Master entity - represents a donor organization
 */
@Entity
@Table(name = "donor_master")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@EqualsAndHashCode(exclude = {"contacts", "grants", "mapping"}, callSuper = true)
@ToString(exclude = {"contacts", "grants", "mapping"})
public class DonorMaster extends AuditEntity {

    @Column(nullable = false, unique = true, length = 20)
    private String donorCode;

    @Column(nullable = false, length = 255)
    private String donorName;

    @Column(nullable = false, length = 50)
    private String donorType;

    @Column(nullable = false, length = 50)
    @Enumerated(EnumType.STRING)
    private FundClass fundClass;

    @Column(nullable = false, length = 255)
    private String email;

    @Column(length = 20)
    private String phoneNumber;

    @Column(length = 255)
    private String website;

    @Column(length = 100)
    private String registrationNumber;

    @Column(length = 100)
    private String taxId;

    // FCRA / domicile / statutory-identity fields (workbook sheets 02 & 10, V13).
    @Column(name = "donor_source", length = 50)
    private String donorSource;

    @Column(name = "fund_source_domicile", length = 20)
    private String fundSourceDomicile; // 'Domestic' | 'Foreign'

    @Column(name = "fcra_applicable")
    @Builder.Default
    private Boolean fcraApplicable = false;

    @Column(name = "foreign_fund_source_type", length = 50)
    private String foreignFundSourceType;

    @Column(name = "foreign_country_name", length = 100)
    private String foreignCountryName;

    @Column(name = "pan_card_number", length = 20)
    private String panCardNumber;

    @Column(name = "bank_account_ref", length = 100)
    private String bankAccountRef;

    @Column(name = "mou_link", length = 500)
    private String mouLink;

    @Column(columnDefinition = "TEXT")
    private String address;

    @ManyToOne
    @JoinColumn(name = "city_id", foreignKey = @ForeignKey(name = "fk_donor_city"))
    private CityMaster city;

    @ManyToOne
    @JoinColumn(name = "state_id", foreignKey = @ForeignKey(name = "fk_donor_state"))
    private StateMaster state;

    @Column(length = 100, nullable = false)
    @Builder.Default
    private String country = "India";

    @Column(length = 20)
    private String postalCode;

    @Column(length = 50, nullable = false)
    @Enumerated(EnumType.STRING)
    @Builder.Default
    private DonorStatus status = DonorStatus.DRAFT;

    @Column(nullable = false)
    @Builder.Default
    private Integer onboardingStep = 1;

    @Column(nullable = false)
    @Builder.Default
    private Boolean isActive = false;

    @OneToMany(mappedBy = "donor", cascade = CascadeType.ALL, orphanRemoval = true)
    @Builder.Default
    private List<DonorContact> contacts = new ArrayList<>();

    @OneToMany(mappedBy = "donor", cascade = CascadeType.ALL, orphanRemoval = true)
    @Builder.Default
    private List<GrantAgreement> grants = new ArrayList<>();

    @OneToOne(mappedBy = "donor", cascade = CascadeType.ALL, orphanRemoval = true)
    private DonorMapping mapping;
}
