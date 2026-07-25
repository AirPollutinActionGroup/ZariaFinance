package com.ngo.finance.donor.entity;

import com.ngo.finance.common.entity.AuditEntity;
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
import jakarta.persistence.Table;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;
import lombok.ToString;

/**
 * Grant Agreement entity - Aggregate Root
 * Owns: GrantRule, GrantReporting, GrantTranche, GrantDocument,
 * GrantBudgetHead, GrantKPI, GrantGeography
 */
@Entity
@Table(name = "grant_agreement")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@EqualsAndHashCode(exclude = { "donor", "programme", "fundProfile", "rules", "reporting", "tranches", "documents",
        "budgetHeads", "kpis", "geographies" }, callSuper = true)
@ToString(exclude = { "donor", "programme", "fundProfile", "rules", "reporting", "tranches", "documents", "budgetHeads",
        "kpis", "geographies" })
public class GrantAgreement extends AuditEntity {

    @Column(nullable = false, unique = true, length = 20)
    private String grantCode;

    @ManyToOne
    @JoinColumn(name = "donor_id", nullable = false, foreignKey = @ForeignKey(name = "fk_grant_donor"))
    private DonorMaster donor;

    // Nullable: untied grants have no programme (inherited from the fund profile).
    @ManyToOne
    @JoinColumn(name = "programme_id", foreignKey = @ForeignKey(name = "fk_grant_programme"))
    private Programme programme;

    // The fund profile this grant inherits (donor, programme, class A/B/C, rules).
    @ManyToOne
    @JoinColumn(name = "fund_profile_id", foreignKey = @ForeignKey(name = "fk_grant_fund_profile"))
    private DonorFundProfile fundProfile;

    @Column(nullable = false, length = 255)
    private String agreementName;

    @Column(nullable = false)
    private LocalDate agreementDate;

    @Column(nullable = false)
    private LocalDate startDate;

    @Column(nullable = false)
    private LocalDate endDate;

    @Column(nullable = false, precision = 15, scale = 2)
    private BigDecimal totalGrantAmount;

    // Multi-currency + donor-locked FX (workbook sheet 07 / architecture §6.3).
    @Column(name = "grant_currency", length = 10)
    @Builder.Default
    private String grantCurrency = "INR";

    @Column(name = "fx_locked_rate", precision = 12, scale = 4)
    @Builder.Default
    private BigDecimal fxLockedRate = BigDecimal.ONE;

    @Column(name = "reporting_amount_inr", precision = 18, scale = 2)
    private BigDecimal reportingAmountInr;

    // Seeded illustrative "utilised" placeholder until a real actuals module ships.
    @Column(name = "utilised_amount", precision = 18, scale = 2)
    @Builder.Default
    private BigDecimal utilisedAmount = BigDecimal.ZERO;

    // Superseded by fundProfile.fundClassCode (A/B/C); retained nullable for now.
    @Column(length = 50)
    @Enumerated(EnumType.STRING)
    private FundClass fundClass;

    @Column(nullable = false)
    @Builder.Default
    private Boolean isActive = true;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Column(length = 500)
    private String agreementDocumentPath;

    @OneToMany(mappedBy = "grant", cascade = CascadeType.ALL, orphanRemoval = true)
    @Builder.Default
    private List<GrantRule> rules = new ArrayList<>();

    @OneToMany(mappedBy = "grant", cascade = CascadeType.ALL, orphanRemoval = true)
    @Builder.Default
    private List<GrantReporting> reporting = new ArrayList<>();

    @OneToMany(mappedBy = "grant", cascade = CascadeType.ALL, orphanRemoval = true)
    @Builder.Default
    private List<GrantTranche> tranches = new ArrayList<>();

    @OneToMany(mappedBy = "grant", cascade = CascadeType.ALL, orphanRemoval = true)
    @Builder.Default
    private List<GrantDocument> documents = new ArrayList<>();

    @OneToMany(mappedBy = "grant", cascade = CascadeType.ALL, orphanRemoval = true)
    @Builder.Default
    private List<GrantBudgetHead> budgetHeads = new ArrayList<>();

    @OneToMany(mappedBy = "grant", cascade = CascadeType.ALL, orphanRemoval = true)
    @Builder.Default
    private List<GrantKPI> kpis = new ArrayList<>();

    @OneToMany(mappedBy = "grant", cascade = CascadeType.ALL, orphanRemoval = true)
    @Builder.Default
    private List<GrantGeography> geographies = new ArrayList<>();

    @Column(name = "approved_by")
    private Long approvedBy;

    @Column(name = "approval_remarks", columnDefinition = "TEXT")
    private String approvalRemarks;

    @Column(name = "is_approved", nullable = false)
    @Builder.Default
    private Integer isApproved = 2; // 1 = approved, 2 = pending, 3 = on hold, 4 = completed

    @Column(name = "approval_date")
    private LocalDateTime approvalDate;
}
