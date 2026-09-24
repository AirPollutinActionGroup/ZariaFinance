package com.ngo.finance.masters.donortype.entity;

import com.ngo.finance.common.entity.AuditEntity;
import com.ngo.finance.common.enums.ContributionType;
import com.ngo.finance.common.enums.FundSourceDomicile;
import jakarta.persistence.CollectionTable;
import jakarta.persistence.Column;
import jakarta.persistence.ElementCollection;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.Table;
import java.util.HashSet;
import java.util.Set;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Donor Type master entity — manageable list of donor types (Corporate CSR,
 * Individual, Foundation, Government, …) shown on the Donor Register form
 * and under Master Configuration. The auto-generated {@code id} is the
 * stable identifier donor records and business rules key off; there is no
 * separate manual code. Each donor type also declares which Fund Source
 * Domicile(s) and Contribution Type(s) are valid for it, so the donor form
 * can constrain those fields once a donor type is chosen.
 */
@Entity
@Table(name = "donor_type_master")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DonorTypeMaster extends AuditEntity {

    @Column(nullable = false, unique = true, length = 255)
    private String name;

    @Column(nullable = false)
    @Builder.Default
    private Boolean status = true;

    @ElementCollection(fetch = FetchType.EAGER)
    @CollectionTable(name = "donor_type_master_fund_source_domicile", joinColumns = @JoinColumn(name = "donor_type_id"))
    @Column(name = "fund_source_domicile")
    @Enumerated(EnumType.STRING)
    @Builder.Default
    private Set<FundSourceDomicile> allowedFundSourceDomiciles = new HashSet<>();

    @ElementCollection(fetch = FetchType.EAGER)
    @CollectionTable(name = "donor_type_master_contribution_type", joinColumns = @JoinColumn(name = "donor_type_id"))
    @Column(name = "contribution_type")
    @Enumerated(EnumType.STRING)
    @Builder.Default
    private Set<ContributionType> allowedContributionTypes = new HashSet<>();
}
