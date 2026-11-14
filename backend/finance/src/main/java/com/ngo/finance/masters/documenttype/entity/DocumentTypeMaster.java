package com.ngo.finance.masters.documenttype.entity;

import com.ngo.finance.common.entity.AuditEntity;
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
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;

/**
 * Document Type master — an identity document a donor can be identified by
 * (PAN Card, Aadhaar Card, Passport ID, …). Donors store the {@code code}.
 */
@Entity
@Table(name = "document_type_master")
@Data
@EqualsAndHashCode(callSuper = false)
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DocumentTypeMaster extends AuditEntity {

    /** Stable identifier stored on donors, e.g. PAN_CARD. Never changes after creation. */
    @Column(nullable = false, unique = true, length = 50)
    private String code;

    /** Label shown on forms, e.g. "PAN Card". */
    @Column(nullable = false, unique = true, length = 255)
    private String name;

    @Column(nullable = false)
    @Builder.Default
    private Boolean status = true;

    /** Domiciles this type applies to; empty = both (domestic and foreign donors). */
    @ElementCollection(fetch = FetchType.EAGER)
    @CollectionTable(
            name = "document_type_master_fund_source_domicile",
            joinColumns = @JoinColumn(name = "document_type_id"))
    @Column(name = "fund_source_domicile")
    @Enumerated(EnumType.STRING)
    @Builder.Default
    private Set<FundSourceDomicile> allowedFundSourceDomiciles = new HashSet<>();

    /** True when a donor with this domicile may use the type (null domicile = not yet chosen). */
    public boolean appliesTo(FundSourceDomicile domicile) {
        return domicile == null || allowedFundSourceDomiciles.isEmpty() || allowedFundSourceDomiciles.contains(domicile);
    }
}
