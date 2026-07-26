package com.ngo.finance.donation.entity;

import com.ngo.finance.common.entity.AuditEntity;
import com.ngo.finance.donation.enums.GikIntendedUse;
import com.ngo.finance.donation.enums.GikRealisationStatus;
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
 * One line item within a gift-in-kind donation. Intended use — not the item —
 * decides the accounting leg, and is mutable after receipt: every change is
 * logged in {@link DonationGikIntendedUseChange} rather than overwritten.
 */
@Entity
@Table(name = "donation_gik_item")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@EqualsAndHashCode(exclude = {"donation", "intendedUseChanges"}, callSuper = true)
@ToString(exclude = {"donation", "intendedUseChanges"})
public class DonationGikItem extends AuditEntity {

    @ManyToOne
    @JoinColumn(name = "donation_id", nullable = false, foreignKey = @ForeignKey(name = "fk_gik_item_donation"))
    private Donation donation;

    @Column(name = "item_description", nullable = false, length = 255)
    private String itemDescription;

    @Column(name = "fair_value", nullable = false, precision = 18, scale = 2)
    private BigDecimal fairValue;

    @Column(name = "intended_use", nullable = false, length = 20)
    @Enumerated(EnumType.STRING)
    private GikIntendedUse intendedUse;

    // Set for DISTRIBUTE / USE_INTERNALLY.
    @Column(name = "expiry_date")
    private LocalDate expiryDate;

    // Set for SELL — 31 Mar of the 2nd FY after receipt; realisation is an
    // Income Tax Act violation if missed.
    @Column(name = "liquidation_due_date")
    private LocalDate liquidationDueDate;

    @Column(name = "realisation_status", nullable = false, length = 20)
    @Enumerated(EnumType.STRING)
    @Builder.Default
    private GikRealisationStatus realisationStatus = GikRealisationStatus.PENDING;

    @OneToMany(mappedBy = "gikItem", cascade = CascadeType.ALL, orphanRemoval = true)
    @Builder.Default
    private List<DonationGikIntendedUseChange> intendedUseChanges = new ArrayList<>();
}
