package com.ngo.finance.donor.entity;

import com.ngo.finance.common.entity.AuditEntity;
import com.ngo.finance.donor.enums.ReportingFrequency;
import jakarta.persistence.CascadeType;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
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
 * Donor Fund Profile — the "behavioural heart" of the donor module (workbook
 * sheet 03). A donor has one or more fund profiles; each grant inherits exactly
 * one profile. The profile carries the fund-use behaviour (mode, restriction
 * class A/B/C, movement / explanation rules, overhead cap, reporting cadence)
 * and owns the donor-permitted geography, utilisation and disbursement rules.
 *
 * NOTE: {@code fundClassCode} (A/B/C) is the restriction class and is distinct
 * from {@link DonorMaster#getFundClass()} (the DOMESTIC/CORPORATE/...
 * typology).
 */
@Entity
@Table(name = "donor_fund_profile")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@EqualsAndHashCode(exclude = { "donor", "programme", "spendableLocations", "utilisationRules",
        "disbursementRules" }, callSuper = true)
@ToString(exclude = { "donor", "programme", "spendableLocations", "utilisationRules", "disbursementRules" })
public class DonorFundProfile extends AuditEntity {

    @ManyToOne
    @JoinColumn(name = "donor_id", nullable = false, foreignKey = @ForeignKey(name = "fk_profile_donor"))
    private DonorMaster donor;

    @Column(name = "fund_mode", length = 30)
    private String fundMode;

    @Column(name = "fund_class_code", length = 1)
    private String fundClassCode;

    @Column(name = "reporting_frequency", length = 30)
    @Enumerated(EnumType.STRING)
    private ReportingFrequency reportingFrequency;

    @Column(columnDefinition = "TEXT")
    private String purpose;

    @ManyToOne
    @JoinColumn(name = "programme_id", foreignKey = @ForeignKey(name = "fk_profile_programme"))
    private Programme programme;

    @Column(name = "programme_tied")
    @Builder.Default
    private Boolean programmeTied = false;

    @Column(name = "movement_allowed")
    @Builder.Default
    private Boolean movementAllowed = false;

    @Column(name = "explanation_required")
    @Builder.Default
    private Boolean explanationRequired = false;

    @Column(name = "onboarding_complete")
    @Builder.Default
    private Boolean onboardingComplete = false;

    @OneToMany(mappedBy = "donorFundProfile", cascade = CascadeType.ALL, orphanRemoval = true)
    @Builder.Default
    private List<SpendableLocation> spendableLocations = new ArrayList<>();

    @OneToMany(mappedBy = "fundProfile", cascade = CascadeType.ALL, orphanRemoval = true)
    @Builder.Default
    private List<DonorUtilisationRule> utilisationRules = new ArrayList<>();

    @OneToMany(mappedBy = "fundProfile", cascade = CascadeType.ALL, orphanRemoval = true)
    @Builder.Default
    private List<DonorDisbursementRule> disbursementRules = new ArrayList<>();

    // The donor-agreed release schedule. Σ trancheAmount is the Total Grant Amount
    // inherited by every grant on this profile.
    @OneToMany(mappedBy = "fundProfile", cascade = CascadeType.ALL, orphanRemoval = true)
    @Builder.Default
    private List<FundProfileTranche> tranches = new ArrayList<>();

    /** Σ of the tranche plan — the total this profile commits, in the donor's currency. */
    public BigDecimal plannedTotalAmount() {
        return tranches.stream()
                .map(FundProfileTranche::getTrancheAmount)
                .filter(java.util.Objects::nonNull)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
    }
}
