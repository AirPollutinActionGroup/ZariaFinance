package com.ngo.finance.donor.entity;

import com.ngo.finance.common.entity.AuditEntity;
import com.ngo.finance.donation.enums.FundMode;
import com.ngo.finance.donor.enums.FundClass;
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
import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;
import lombok.ToString;

/**
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
@EqualsAndHashCode(exclude = { "donor", "programme", "geographies", "utilisationRules",
        "disbursementRules" }, callSuper = true)
@ToString(exclude = { "donor", "programme", "geographies", "utilisationRules", "disbursementRules" })
public class DonorFundProfile extends AuditEntity {

    @ManyToOne
    @JoinColumn(name = "donor_id", nullable = false, foreignKey = @ForeignKey(name = "fk_profile_donor"))
    private DonorMaster donor;

    @Column(name = "fund_mode", length = 30)
    @Enumerated(EnumType.STRING)
    private FundMode fundMode;

    @Column(name = "fund_class", length = 30)
    @Enumerated(EnumType.STRING)
    private FundClass fundClass;

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

    @OneToMany(mappedBy = "fundProfile", cascade = CascadeType.ALL, orphanRemoval = true)
    @Builder.Default
    private List<SpendableGeography> geographies = new ArrayList<>();

    @OneToMany(mappedBy = "fundProfile", cascade = CascadeType.ALL, orphanRemoval = true)
    @Builder.Default
    private List<DonorUtilisationRule> utilisationRules = new ArrayList<>();

    @OneToMany(mappedBy = "fundProfile", cascade = CascadeType.ALL, orphanRemoval = true)
    @Builder.Default
    private List<DonorDisbursementRule> disbursementRules = new ArrayList<>();

}
