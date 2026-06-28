package com.ngo.finance.donor.entity;

import com.ngo.finance.common.entity.AuditEntity;
import com.ngo.finance.donor.enums.FundClass;
import com.ngo.finance.donor.enums.GrantStatus;
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
 * Owns: GrantRule, GrantReporting, GrantTranche, GrantDocument, GrantBudgetHead, GrantKPI, GrantGeography
 */
@Entity
@Table(name = "grant_agreement")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@EqualsAndHashCode(exclude = {"donor", "programme", "rules", "reporting", "tranches", "documents", "budgetHeads", "kpis", "geographies"}, callSuper = true)
@ToString(exclude = {"donor", "programme", "rules", "reporting", "tranches", "documents", "budgetHeads", "kpis", "geographies"})
public class GrantAgreement extends AuditEntity {

    @Column(nullable = false, unique = true, length = 20)
    private String grantCode;

    @ManyToOne
    @JoinColumn(name = "donor_id", nullable = false, foreignKey = @ForeignKey(name = "fk_grant_donor"))
    private DonorMaster donor;

    @ManyToOne
    @JoinColumn(name = "programme_id", nullable = false, foreignKey = @ForeignKey(name = "fk_grant_programme"))
    private Programme programme;

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

    @Column(nullable = false, length = 50)
    @Enumerated(EnumType.STRING)
    private FundClass fundClass;

    @Column(length = 50, nullable = false)
    @Enumerated(EnumType.STRING)
    @Builder.Default
    private GrantStatus grantStatus = GrantStatus.DRAFT;

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
}
